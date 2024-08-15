import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { AuthenticationService } from 'src/services/authentication.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit{
  @Input() post?: Post;
  isLiked?: boolean = false; 
  isDisliked?: boolean = false;

  constructor(private postsService: PostsService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.checkIfLiked();
    this.checkIfDisliked();
  }

  likePost() {
    const userId = this.authService.loggedInUserId;
    if (!this.post?.postId || !userId) return;

    if (this.isLiked) {
      this.postsService.removeLike(this.post.postId, userId)
        .then(() => {
          console.log('Post unliked successfully');
          this.isLiked = false;
          this.post!.likeCount!--;
        })
        .catch(error => {
          console.error('Error unliking post:', error);
        });
    } else {
      this.postsService.addLike(this.post.postId, userId)
        .then(() => {
          console.log('Post liked successfully');
          this.isLiked = true;
          this.post!.likeCount!++;
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
      this.postsService.removeDislike(this.post.postId, userId)
      .then(() => {
        console.log('Post undisliked successfully');
        this.isDisliked = false;
        this.post!.dislikeCount!--;
      })
      .catch(error => {
        console.error('Error undisliking post:', error);
      });
    } else {
      this.postsService.addDislike(this.post.postId, userId)
        .then(() => {
          console.log('Post disliked successfully.');
          this.isDisliked = true;
          this.post!.dislikeCount!++;
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
}
