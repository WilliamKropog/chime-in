import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { UserService } from 'src/services/user.service';
import { take, timestamp } from 'rxjs';

@Component({
  selector: 'app-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.css']
})
export class FeaturedComponent implements OnInit, OnDestroy{

  followedPosts: Post[] = [];
  recommendedProfiles: any[] = [];
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
    this.isLoadingPosts = true;
    this.userService.getFollowedUserIds()
    .subscribe(userIds => {
      if (userIds && userIds.length > 0) {
        this.followedUserIds = userIds;
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
      });
  }

  loadMorePosts(): void {
    if (this.isLoadingPosts) return;

    this.isLoadingPosts = true;
    this.postsService.getMorePostsFromUsers(this.followedUserIds, this.postLoadLimit)
      .subscribe(posts => {
        this.followedPosts = [...this.followedPosts, ...posts];
        this.incrementViewCount(posts);
        this.isLoadingPosts = false;
      });
  }

  loadRecommendedProfiles(count: number): void {
    this.recommendedProfiles = [];
    for (let i = 0; i < count; i++) {
      this.userService.getRandomRecommendedUser().subscribe(user => {
        if (user) {
          this.recommendedProfiles.push(user);
        }
      });
    }
  }

  loadMoreRecommendedProfiles(count: number): void {
    this.isLoadingPosts = true;

    for (let i = 0; i < count; i++) {
      this.userService.getRandomRecommendedUser().subscribe(user => {
        if (user) {
          this.recommendedProfiles.push(user);
        }
      });
    }
    this.isLoadingPosts = false;
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
        if (this.followedPosts.length > 0){
          console.log('Attempting to load more posts...')
          this.loadMorePosts();
        } else {
          console.log('Attempting to load more recommended profiles...');
          this.loadMoreRecommendedProfiles(3);
        }
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
  }

}
