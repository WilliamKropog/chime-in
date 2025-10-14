import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Post, Comment } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { of, shareReplay, Subscription, switchMap } from 'rxjs';
import { CommentEditorService } from 'src/services/commenteditor.service';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import type { User } from 'src/interface';
import { UserService } from 'src/services/user.service';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
    standalone: false
})
export class PostComponent implements OnInit, OnDestroy{

  public currentUser$!: Observable<Pick<User, 'uid'|'isAdmin'|'isMod'>>;

  @Input() post?: Post;
  @ViewChild('menuAnchor') private menuAnchorRef?: ElementRef<HTMLElement>;
  commentsList: Comment[] = [];
  topComment?: Comment;
  isLiked?: boolean = false; 
  isDisliked?: boolean = false;
  isCommentEditorOpen: boolean = false;
  isPostMenuOpen: boolean = false;
  private editorSubscription?: Subscription;
  private topCommentSubscription?: Subscription;
  private commentsSubscription?: Subscription;

  constructor(
    private postsService: PostsService, 
    private userService: UserService,
    private authService: AuthenticationService,
    private commentEditorService: CommentEditorService,
    private router: Router,
  ) { }

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

  ngOnDestroy(): void {
    this.editorSubscription?.unsubscribe();
    this.commentsSubscription?.unsubscribe();
    this.topCommentSubscription?.unsubscribe();
  }

  visitPost(): void {
    if (this.post?.postId) {
      this.router.navigate(['/post', this.post.postId]);
    }
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
      this.postsService.removeLike(this.post.postId, userId)
        .then(() => {
          console.log('Post unliked successfully');
        })
        .catch(error => {
          console.error('Error unliking post:', error);
        });
    } else {
      this.isLiked = true;
      this.post!.likeCount!++;
      this.postsService.addLike(this.post.postId, userId)
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
      this.postsService.removeDislike(this.post.postId, userId)
      .then(() => {
        console.log('Post undisliked successfully');
      })
      .catch(error => {
        console.error('Error undisliking post:', error);
      });
    } else {
      this.isDisliked = true;
      this.post!.dislikeCount!++;
      this.postsService.addDislike(this.post.postId, userId)
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
    } else {
      this.isPostMenuOpen = true;
    }
  }

  @HostListener('document:click', ['$event']) onDocumentClick(event: MouseEvent): void {
    if (!this.isPostMenuOpen) return;
    const anchor = this.menuAnchorRef?.nativeElement;
    if (anchor && !anchor.contains(event.target as Node)) {
      this.isPostMenuOpen = false; 
    }
  }

  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.isPostMenuOpen) this.isPostMenuOpen = false;
  } 

}
