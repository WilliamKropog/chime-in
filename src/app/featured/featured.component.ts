import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { UserService } from 'src/services/user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.css']
})
export class FeaturedComponent implements OnInit{

  followedPosts: Post[] = [];
  isLoadingPosts: boolean = false;
  scrollTimeout: any = null;
  scrollThreshold: number = 400;
  private followedUserIds: string[] = [];
  private viewedPosts: Set<string> = new Set();
  private postLoadLimit: number = 9;

  constructor(private postsService: PostsService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadFollowedUserPosts();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  loadFollowedUserPosts(): void {
    console.log('loadFollowedUserPosts called.')
    this.isLoadingPosts = true;
    this.userService.getFollowedUserIds()
    .subscribe(userIds => {
      if (userIds && userIds.length > 0) {
        this.followedUserIds = userIds;
        console.log('Starting loadInitialPosts...')
        this.loadInitialPosts();
      } else {
        this.loadRecommendedProfiles(3);
        this.isLoadingPosts = false;
      }
    });
  }

  loadInitialPosts(): void {
    this.isLoadingPosts = true;
    this.postsService.getPostsFromUsers(this.followedUserIds, this.postLoadLimit)
      .subscribe(posts => {
        this.followedPosts = posts;
        this.incrementViewCount(posts);
        this.isLoadingPosts = false;
        console.log('Initial posts loaded, total posts:', this.followedPosts.length);
      });
  }

  loadMorePosts(): void {
    if (this.isLoadingPosts) return;

    this.isLoadingPosts = true;
    console.log('Loading more posts...');
    this.postsService.getMorePostsFromUsers(this.followedUserIds, this.postLoadLimit)
      .subscribe(posts => {
        this.followedPosts = [...this.followedPosts, ...posts];
        this.incrementViewCount(posts);
        this.isLoadingPosts = false;
        console.log('Additional posts loaded, total posts:', this.followedPosts.length);
      });
  }

  loadRecommendedProfiles(count: number): void {
    for (let i = 0; i < count; i++) {
      this.userService.getRandomRecommendedUser().subscribe(user => {
        if (user) {
          this.followedPosts.push(user);
        }
      });
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const fullHeight = document.documentElement.scrollHeight;

      if ((fullHeight - scrollPosition) < this.scrollThreshold && !this.isLoadingPosts) {
        console.log('Attempting to load more posts...')
        this.loadMorePosts();
      }
    }, 400);
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
    // console.log(`Increment view count for post ${postId}`);
  }

}
