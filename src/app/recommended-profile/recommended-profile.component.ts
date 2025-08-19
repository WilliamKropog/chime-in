import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { UserService } from 'src/services/user.service';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-recommended-profile',
    templateUrl: './recommended-profile.component.html',
    styleUrl: './recommended-profile.component.css',
    standalone: false
})
export class RecommendedProfileComponent implements OnInit, OnDestroy{

  @Input() user: any = null;

  recommendedUser: any = null;
  backgroundImageUrl: string | null = null;
  recentPosts: Post[] = [];
  currentPostIndex: number = 0;
  private carouselInterval: Subscription | undefined;
  profileImageUrl: string = 'assets/images/png-transparent-default-avatar.png';

  constructor(private userService: UserService, private postsService: PostsService) {}

  ngOnInit(): void {
    if (this.user) {
      this.loadRecommendedUser();
      this.carouselInterval = interval(30000).subscribe(() => this.nextPost());
    }
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      this.carouselInterval.unsubscribe();
    }
  }

  loadRecommendedUser(): void {
    this.userService.getRandomRecommendedUser().subscribe(user => {
      if (user) {
        this.recommendedUser = user;
        this.backgroundImageUrl = user.backgroundImageURL || null;
        this.userService.getUserProfileImageUrl(user.id).subscribe(imageUrl => {
          this.profileImageUrl = imageUrl;
        });
        this.loadRecentPosts(user.id);
      } else {
        console.error('No recommended user found.');
      }
    });
  }

  loadRecentPosts(userId: string): void {
    this.postsService.getThreeMostRecentPostsByUser(userId).subscribe(posts => {
      this.recentPosts = posts;
    });
  }

  nextPost(): void {
    this.currentPostIndex = (this.currentPostIndex + 1) % this.recentPosts.length;
  }

  prevPost(): void {
    this.currentPostIndex = (this.currentPostIndex - 1) % this.recentPosts.length % this.recentPosts.length;
  }

  goToPost(index: number): void {
    this.currentPostIndex = index;
  }

  getPostClass(index: number): string {
    const position = (index - this.currentPostIndex + this.recentPosts.length) % this.recentPosts.length;
    return position === 0 ? 'carousel-slide center' :
      position === 1 ? 'carousel-slide right' :
      position === 2 ? 'carousel-slide left' : 'carousel-slide';
  }

}
