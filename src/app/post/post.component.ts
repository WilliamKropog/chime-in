import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit{
  @Input() post?: Post;

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    if (this.post) {
      const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');

      if (!viewedPosts.includes(this.post.postId)) {
        this.postsService.incrementView(this.post.postId).then(() => {
          viewedPosts.push(this.post?.postId);
          localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        }).catch(error => {
          console.error('Error incrementing view count:', error);
        });
      }
    } else {
      console.error('Post is undefined in ngOnInit.');
    }
  }

}
