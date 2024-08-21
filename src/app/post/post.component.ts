import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { Subscription } from 'rxjs';
import { CommentEditorService } from 'src/services/commenteditor.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy{
  @Input() post?: Post;
  isLiked?: boolean = false; 
  isDisliked?: boolean = false;
  isCommentEditorOpen: boolean = false;
  private editorSubscription?: Subscription;

  constructor(
    private postsService: PostsService, 
    private authService: AuthenticationService,
    private commentEditorService: CommentEditorService,
  ) { }

  ngOnInit(): void {
    this.checkIfLiked();
    this.checkIfDisliked();

    this.editorSubscription = this.commentEditorService.openEditor$.subscribe(openPostId => {
      if (openPostId !== this.post?.postId) {
        this.isCommentEditorOpen = false;
      }
    })
  }

  ngOnDestroy(): void {
    this.editorSubscription?.unsubscribe();
  }

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

}
