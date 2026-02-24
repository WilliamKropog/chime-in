import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Comment } from 'src/interface';
import { AuthenticationService } from 'src/services/authentication.service';
import { CommentEditorService } from 'src/services/commenteditor.service';
import { UserService } from 'src/services/user.service';
import { ProfileUpdateService } from 'src/services/profile-update.service';
import { merge, Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

const DEFAULT_AVATAR = 'assets/images/png-transparent-default-avatar.png';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.css'],
    standalone: false
})
export class CommentComponent implements OnInit, OnDestroy{
  @Input() postId!: string;
  @Input() comment?: Comment;
  isLiked?:boolean = false;
  isDisliked?:boolean = false;
  private userId?: string;
  /** Comment author's current profile image so pfp updates when user changes it. */
  authorPhotoUrl$: Observable<string> = of(DEFAULT_AVATAR);

  constructor(
    private authService: AuthenticationService,
    private commentEditorService: CommentEditorService,
    private userService: UserService,
    private profileUpdateService: ProfileUpdateService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.loggedInUserId;
    
    if (this.comment && this.userId) {
      this.checkIfLiked();
      this.checkIfDisliked();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const comment = changes['comment']?.currentValue as Comment | undefined;
    if (comment?.userId) {
      const initial$ = this.userService.getUserProfile(comment.userId).pipe(
        take(1),
        map((d: any) => d?.profileImageURL || DEFAULT_AVATAR)
      );
      const onProfileUpdate$ = this.profileUpdateService.profileUpdated$.pipe(
        filter((uid) => uid === comment.userId),
        switchMap(() =>
          this.userService.getUserProfile(comment.userId).pipe(
            take(1),
            map((d: any) => d?.profileImageURL || DEFAULT_AVATAR)
          )
        )
      );
      this.authorPhotoUrl$ = merge(initial$, onProfileUpdate$);
    } else {
      this.authorPhotoUrl$ = of(DEFAULT_AVATAR);
    }
    if (comment && this.userId) {
      this.checkIfLiked();
      this.checkIfDisliked();
    }
  }

  ngOnDestroy(): void {
    
  }

  likeComment() {
    if (!this.postId || !this.comment?.commentId || !this.userId) {
      console.log('Like comment cliked but failed. Details:', {
        postId: this.postId,
        commentId: this.comment?.commentId,
        userId: this.userId,
      });
      return;
    }
    if (this.isLiked) {
      this.isLiked = false;
      this.comment!.likeCount!--;
      this.commentEditorService
      .removeLikeFromComment(this.postId, this.comment.commentId)
      .then(() => {
        console.log('Comment unliked successfully.');
      })
      .catch(error => {
        console.error('Error unliking comment:', error);
      });
    } else {
      console.log('Attempting to like comment. Details:', {
        postId: this.postId,
        commentId: this.comment.commentId,
        userId: this.userId,
      });
      this.isLiked = true;
      this.comment!.likeCount!++;
      this.commentEditorService
      .addLikeToComment(this.postId, this.comment.commentId)
      .then(() => {
        console.log('Comment liked successfully.');
      })
      .catch(error => {
        console.error('Error liking comment:', error);
      });
    }
  }

  dislikeComment() {
    if (!this.postId || !this.comment?.commentId || !this.userId) {
      console.log('Dislike comment clicked but failed.');
      return;
    }

    if (this.isDisliked) {
      this.isDisliked = false;
      this.comment!.dislikeCount!--;
      this.commentEditorService
        .removeDislikeFromComment(this.postId, this.comment.commentId)
        .then(() => {
          console.log('Comment undisliked successfully.');
        })
        .catch(error => {
          console.error('Error undisliking comment:', error);
        });
    } else {
      this.isDisliked = true;
      this.comment!.dislikeCount!++;
      this.commentEditorService
        .addDislikeToComment(this.postId, this.comment.commentId)
        .then(() => {
          console.log('Comment disliked successfully.');
        })
        .catch(error => {
          console.error('Error disliking comment:', error);
        });
    }
  }

  checkIfLiked() {
    if (!this.postId || !this.comment?.commentId || !this.userId) return;

    this.commentEditorService.checkIfUserLikedComment(this.postId, this.comment.commentId, this.userId)
      .then(isLiked => {
        this.isLiked = isLiked;
      })
      .catch(error => {
        console.error('Error checking if comment is liked:', error);
      });
  }

  checkIfDisliked() {
    if (!this.postId || !this.comment?.commentId || !this.userId) return;

    this.commentEditorService.checkIfUserDislikedComment(this.postId, this.comment.commentId, this.userId)
      .then(isDisliked => {
        this.isDisliked = isDisliked;
      })
      .catch(error => {
        console.error('Error checking if comment is disliked:', error);
      });
  }
}
