import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { UserService } from 'src/services/user.service';

@Component({
    selector: 'app-featured',
    templateUrl: './featured.component.html',
    styleUrls: ['./featured.component.css'],
    standalone: false
})
export class FeaturedComponent implements OnInit, OnDestroy{

  followedPosts: Post[] = [];
  recommendedProfiles: any[] = [];
  isLoadingInitial = false;
  isLoadingMore = false;
  hasMorePosts = true;
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
    this.isLoadingInitial = true;
    this.userService.getFollowedUserIds()
    .subscribe(userIds => {
      if (userIds && userIds.length > 0) {
        this.followedUserIds = userIds;
        this.loadInitialPosts();
      } else {
        this.loadRecommendedProfiles(3);
        this.isLoadingInitial = false;
      }
    });
  }

  private mergeUniqueById(existing: Post[], incoming: Post[]): Post[] {
    const seen = new Set(existing.map(p => p.postId));
    const dedupIncoming = incoming.filter(p => !seen.has(p.postId));
    return [...existing, ...dedupIncoming];
  }

  loadInitialPosts(): void {
    this.isLoadingInitial = true;
    this.hasMorePosts = true;
    this.postsService.getPostsFromUsers(this.followedUserIds, this.postLoadLimit)
      .subscribe({
        next: posts => {
          this.followedPosts = posts;
          if (posts.length < this.postLoadLimit) {
            this.hasMorePosts = false;
          }
          this.isLoadingInitial = false;
        },
        error: () => {
          this.isLoadingInitial = false;
        }
      });
  }

  loadMorePosts(): void {
    if (this.isLoadingInitial || this.isLoadingMore || !this.hasMorePosts) return;

    this.isLoadingMore = true;
    const previousCount = this.followedPosts.length;
    this.postsService.getMorePostsFromUsers(this.followedUserIds, this.postLoadLimit)
      .subscribe({
        next: posts => {
          if (!posts.length) {
            this.hasMorePosts = false;
          } else {
            this.followedPosts = this.mergeUniqueById(this.followedPosts, posts);
            const addedCount = this.followedPosts.length - previousCount;
            if (addedCount === 0 || posts.length < this.postLoadLimit) {
              this.hasMorePosts = false;
            }
          }
          this.isLoadingMore = false;
        },
        error: () => {
          this.isLoadingMore = false;
        }
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
    this.isLoadingMore = true;

    for (let i = 0; i < count; i++) {
      this.userService.getRandomRecommendedUser().subscribe(user => {
        if (user) {
          this.recommendedProfiles.push(user);
        }
      });
    }
    this.isLoadingMore = false;
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const fullHeight = document.documentElement.scrollHeight;

      if ((fullHeight - scrollPosition) < this.scrollThreshold && !this.isLoadingInitial && !this.isLoadingMore) {
        if (this.followedPosts.length > 0) {
          if (this.hasMorePosts) {
            this.loadMorePosts();
          }
        } else {
          this.loadMoreRecommendedProfiles(3);
        }
      }
    }, 400);
  }

  // Views are counted on the post page (open), not when a feed renders.

}
