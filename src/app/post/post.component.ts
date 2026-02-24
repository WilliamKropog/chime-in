import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Post, Comment } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { merge, of, shareReplay, Subscription, switchMap } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { CommentEditorService } from 'src/services/commenteditor.service';
import { PostMenuStateService } from 'src/services/post-menu-state.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import type { User } from 'src/interface';
import { UserService } from 'src/services/user.service';
import { ProfileUpdateService } from 'src/services/profile-update.service';

const DEFAULT_AVATAR = 'assets/images/png-transparent-default-avatar.png';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
    standalone: false
})
export class PostComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  public currentUser$!: Observable<Pick<User, 'uid'|'isAdmin'|'isMod'>>;
  /** Author's current profile image (from Firestore), so pfp updates everywhere when user changes it. */
  authorPhotoUrl$: Observable<string> = of(DEFAULT_AVATAR);

  @Input() post?: Post;
  @ViewChild('postRef') private postRef?: ElementRef<HTMLElement>;
  @ViewChild('menuAnchor') private menuAnchorRef?: ElementRef<HTMLElement>;
  @ViewChild('postMenuRef') private postMenuRef?: ElementRef<HTMLElement>;
  @Output() deleted = new EventEmitter<string>();
  commentsList: Comment[] = [];
  topComment?: Comment;
  isLiked?: boolean = false; 
  isDisliked?: boolean = false;
  isCommentEditorOpen: boolean = false;
  isPostMenuOpen: boolean = false;
  menuPosition: { left: number; top: number } | null = null;
  private editorSubscription?: Subscription;
  private topCommentSubscription?: Subscription;
  private commentsSubscription?: Subscription;
  private menuStateSubscription?: Subscription;
  private viewCountObserver: IntersectionObserver | null = null;

  constructor(
    private postsService: PostsService, 
    private userService: UserService,
    private authService: AuthenticationService,
    private commentEditorService: CommentEditorService,
    private postMenuStateService: PostMenuStateService,
    private router: Router,
    private profileUpdateService: ProfileUpdateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const post = changes['post']?.currentValue as Post | undefined;
    if (post?.userId) {
      const initial$ = this.userService.getUserProfile(post.userId).pipe(
        take(1),
        map((d: any) => d?.profileImageURL || DEFAULT_AVATAR)
      );
      const onProfileUpdate$ = this.profileUpdateService.profileUpdated$.pipe(
        filter((uid) => uid === post.userId),
        switchMap(() =>
          this.userService.getUserProfile(post.userId).pipe(
            take(1),
            map((d: any) => d?.profileImageURL || DEFAULT_AVATAR)
          )
        )
      );
      this.authorPhotoUrl$ = merge(initial$, onProfileUpdate$);
    } else {
      this.authorPhotoUrl$ = of(DEFAULT_AVATAR);
    }
  }

  ngOnInit(): void {
    this.checkIfLiked();
    this.checkIfDisliked();

    const uid = this.authService.loggedInUserId;
    this.currentUser$ = uid
      ? this.userService.user$(uid).pipe(
        map(p => ({
          uid,
          isAdmin: !!p?.isAdmin,
          isMod:   !!p?.isMod,
        })),
        shareReplay(1)
      )
    : of({ uid: '', isAdmin: false, isMod: false });

    this.editorSubscription = this.commentEditorService.openEditor$.subscribe(openPostId => {
      if (openPostId !== this.post?.postId) {
        this.isCommentEditorOpen = false;
      }
    });

    this.menuStateSubscription = this.postMenuStateService.menuOpen$.subscribe(openPostId => {
      if (openPostId !== this.post?.postId) {
        this.isPostMenuOpen = false;
        this.menuPosition = null;
      }
    });

    if (this.post?.postId) {
      this.topCommentSubscription = this.postsService.getTopCommentForPost(this.post.postId)
      .subscribe(topComment => {
        this.topComment = topComment;
        const topCommentId = topComment ? topComment.commentId : undefined;

        this.commentsSubscription = this.postsService.getCommentsForPost(this.post!.postId, topCommentId)
        .subscribe(comments => {
          this.commentsList = comments;
        });
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.post?.postId || !this.postRef?.nativeElement) return;

    this.viewCountObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        this.postsService.incrementView(this.post!.postId).catch(() => {});
        this.viewCountObserver?.disconnect();
        this.viewCountObserver = null;
      },
      { threshold: 0.5 }
    );
    this.viewCountObserver.observe(this.postRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.viewCountObserver?.disconnect();
    this.viewCountObserver = null;
    this.editorSubscription?.unsubscribe();
    this.commentsSubscription?.unsubscribe();
    this.topCommentSubscription?.unsubscribe();
    this.menuStateSubscription?.unsubscribe();
  }

  visitPost(): void {
    if (this.post?.postId) {
      this.router.navigate(['/post', this.post.postId]);
    }
  }

  stopEvent(event: Event): void {
    event.stopPropagation();
  }

  onPostCardClick(event: MouseEvent): void {
    // Respect modifier keys for “open in new tab” behavior.
    if (!this.post?.postId) return;
    if (event.button !== 0) return; // only left click

    if (event.metaKey || event.ctrlKey) {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/post', this.post.postId]));
      window.open(url, '_blank', 'noopener');
      return;
    }

    this.visitPost();
  }

  onPostCardKeydown(event: KeyboardEvent): void {
    if (!this.post?.postId) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // prevent page scroll on Space
      this.visitPost();
    }
  }

  onMenuDeleted(postId: string) {
    this.deleted.emit(postId);
    this.isPostMenuOpen = false;
  }

  get currentUserId(): string {
    return this.authService.loggedInUserId;
  }

  //Cloud functions

  likePost() {
    const userId = this.authService.loggedInUserId;
    if (!this.post?.postId || !userId) return;

    if (this.isLiked) {
      this.isLiked = false;
      this.post!.likeCount!--;
      this.postsService.removeLike(this.post.postId)
        .then(() => {
          console.log('Post unliked successfully');
        })
        .catch(error => {
          console.error('Error unliking post:', error);
        });
    } else {
      this.isLiked = true;
      this.post!.likeCount!++;
      console.log('Adding like to Post ID:', this.post.postId);
      this.postsService.addLike(this.post.postId)
        .then(() => {
          console.log('Post liked successfully');
        })
        .catch(error => {
          console.error('Error liking post:', error);
        });
    }
  }

  dislikePost() {
    const userId = this.authService.loggedInUserId;
    if (!this.post?.postId || !userId) return;

    if (this.isDisliked) {
      this.isDisliked = false;
      this.post!.dislikeCount!--;
      this.postsService.removeDislike(this.post.postId)
      .then(() => {
        console.log('Post undisliked successfully');
      })
      .catch(error => {
        console.error('Error undisliking post:', error);
      });
    } else {
      this.isDisliked = true;
      this.post!.dislikeCount!++;
      this.postsService.addDislike(this.post.postId)
        .then(() => {
          console.log('Post disliked successfully.');
        })
        .catch(error => {
          console.error('Error disliking post:', error);
        })
    }
  }

  checkIfLiked() {
    const userId = this.authService.loggedInUserId;
    if (!this.post?.postId || !userId) return;

    this.postsService.checkIfUserLiked(this.post.postId, userId)
      .then(isLiked => {
        this.isLiked = isLiked;
      })
      .catch(error => {
        console.error("Error checking if post is liked:", error);
      })
  }

  checkIfDisliked() {
    const userId = this.authService.loggedInUserId;
    if (!this.post?.postId || !userId) return;

    this.postsService.checkIfUserDisliked(this.post.postId, userId)
      .then(isDisliked => {
        this.isDisliked = isDisliked;
      })
      .catch(error => {
        console.error("Error checking if post is disliked:", error);
      });
  }

  //COMMENT EDITOR BUTTON

  openCommentEditor(): void {
    if (this.isCommentEditorOpen) {
      this.isCommentEditorOpen = false;
      this.commentEditorService.closeEditor();
    } else {
      this.isCommentEditorOpen = true;
      this.commentEditorService.openEditor(this.post?.postId!);
    }
  }

  openPostMenu(): void {
    if (this.isPostMenuOpen) {
      this.isPostMenuOpen = false;
      this.menuPosition = null;
      this.postMenuStateService.closeMenu();
    } else {
      this.postMenuStateService.openMenu(this.post!.postId!);
      this.updateMenuPosition();
      this.isPostMenuOpen = true;
    }
  }

  private updateMenuPosition(): void {
    const anchor = this.menuAnchorRef?.nativeElement;
    const post = this.postRef?.nativeElement;
    if (!anchor || !post) return;
    const anchorRect = anchor.getBoundingClientRect();
    const postRect = post.getBoundingClientRect();
    this.menuPosition = {
      left: anchorRect.left - postRect.left + anchorRect.width / 2,
      top: anchorRect.top - postRect.top + anchorRect.height / 2
    };
  }

  @HostListener('document:click', ['$event']) onDocumentClick(event: MouseEvent): void {
    if (!this.isPostMenuOpen) return;
    const anchor = this.menuAnchorRef?.nativeElement;
    const menu = this.postMenuRef?.nativeElement;
    const inAnchor = anchor?.contains(event.target as Node);
    const inMenu = menu?.contains(event.target as Node);
    if (!inAnchor && !inMenu) {
      this.isPostMenuOpen = false;
      this.menuPosition = null;
      this.postMenuStateService.closeMenu();
    }
  }

  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.isPostMenuOpen) {
      this.isPostMenuOpen = false;
      this.menuPosition = null;
      this.postMenuStateService.closeMenu();
    }
  } 

}
