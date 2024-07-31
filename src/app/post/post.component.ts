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
export class PostComponent{
  @Input() post?: Post;

  constructor(private postsService: PostsService, private authService: AuthenticationService) { }

  likePost() {
    const userId = this.authService.loggedInUserId;
    this.postsService.addLike(this.post?.postId, userId)
    .then(() => {
      console.log('Post liked succesffully');
    })
    .catch(error => {
      console.error('Error liking post:', error);
    });
  }
}
