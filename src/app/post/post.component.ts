import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit{
  @Input() post?: Post;
  isLiked?: boolean = false; 

  constructor(private postsService: PostsService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.checkIfLiked();
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
}
