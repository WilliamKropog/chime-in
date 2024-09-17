import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mostRecentPosts: Post[] = [];
  viewedPosts: Set<string> = new Set();  
  isLoadingPosts: boolean = false;
  scrollTimeout: any = null;
  scrollThreshold: number = 200;

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.loadInitialPosts();
    // console.log('HomeComponent initialized.');
    // this.postsSubscription = this.postsService.getMostRecentPosts().subscribe(posts => {
    //   console.log('Subscription updated.');
    //   this.mostRecentPosts = posts;
    //   this.incrementViewCount(posts);  
    // });
  }

  loadInitialPosts() {
    this.isLoadingPosts = true;
    this.postsService.getMostRecentPosts().subscribe(posts => {
      this.mostRecentPosts = posts;
      this.incrementViewCount(posts);
      this.isLoadingPosts = false;  
    });
  }

  loadMorePosts() {
    if (this.isLoadingPosts) return;

    this.isLoadingPosts = true;
    this.postsService.getMorePosts().subscribe(posts => {
      this.mostRecentPosts = [...this.mostRecentPosts, ...posts];
      this.incrementViewCount(posts);
      this.isLoadingPosts = false;
    });
  }

  //Loads more Posts if user scrolls to bottom of window.

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const fullHeight = document.documentElement.scrollHeight;

      if ((fullHeight - scrollPosition) < this.scrollThreshold && !this.isLoadingPosts) {
        this.loadMorePosts();
      }
    }, 200);
  }

  //Can optimize the following two functions:

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

  //OLD POST UPDATES FUNCTION

  // updatePosts(newPosts: Post[]): void {
  //   const updatedPosts = [...this.mostRecentPosts];
  
  //   newPosts.forEach((newPost) => {
  //     const existingPostIndex = updatedPosts.findIndex(post => post.postId === newPost.postId);
  //     if (existingPostIndex > -1) {
  //       updatedPosts[existingPostIndex] = newPost;
  //     } else {
  //       updatedPosts.push(newPost);
  //     }
  //   });
  //   this.mostRecentPosts = updatedPosts;
  // }
}
