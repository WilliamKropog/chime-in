import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  mostRecentPosts: Post[] = [];
  viewedPosts: Set<string> = new Set();  
  private postsSubscription: Subscription | undefined;

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    console.log('HomeComponent initialized');
    this.postsSubscription = this.postsService.getMostRecentPosts().subscribe(posts => {
      console.log('Subscription received posts');
      this.mostRecentPosts = posts;
      this.incrementViewCount(posts);  
    });
  }

  ngOnDestroy(): void {
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
  }

  incrementViewCount(posts: Post[]): void {
    posts.forEach(post => {
      if (!this.viewedPosts.has(post.postId)) {
        this.viewedPosts.add(post.postId);
        this.incrementPostView(post.postId);  
      }
    });
  }

  incrementPostView(postId: string): void {
    this.postsService.incrementView(postId);
    console.log(`Increment view count for post ${postId}`);
  }
}
