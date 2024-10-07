import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from 'firebase/auth';
import { map, of, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/services/authentication.service';
import { UserService } from 'src/services/user.service';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  hasBackgroundImage: boolean = false;
  hasBio: boolean = false;
  isProfileEditorOpen: boolean = false;
  userPosts: Post[] = [];
  viewedPosts: Set<string> = new Set();
  isLoadingPosts: boolean = false;
  scrollTimeout: any = null;
  scrollThreshHold: number = 200;
  currentUserId: string = '';

  user$ = this.authService.currentUser$.pipe(
    switchMap((authUser: User | null) => {
      if (authUser) {
        this.currentUserId = authUser.uid;
        return this.userService.getUserProfile(authUser.uid).pipe(
          map((firestoreData: any) => {
            this.hasBackgroundImage = !!firestoreData?.backgroundImageURL;
            this.hasBio = !!firestoreData?.bio;
            this.loadUserPosts(authUser.uid);
            return { ...authUser, ...firestoreData };
          })
        );
      } else {
        return of(null);
      }
    })
  );

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private postsService: PostsService,
    private router: Router
  ){}

  loadUserPosts(userId: string): void {
    this.isLoadingPosts = true;
    this.postsService.getUserPosts(userId).subscribe((posts) => {
      this.userPosts = posts;
      this.incrementViewCount(posts);
      this.isLoadingPosts = false;
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const fullHeight = document.documentElement.scrollHeight;

      if ((fullHeight - scrollPosition) < this.scrollThreshHold && !this.isLoadingPosts) {
        this.loadMorePosts();
      }
    }, 200);
  }

  loadMorePosts(): void {
    if (this.isLoadingPosts || !this.currentUserId) return;

    this.isLoadingPosts = true;
    this.postsService.getMoreUserPosts(this.currentUserId).subscribe((posts) => {
      this.userPosts = [...this.userPosts, ...posts];
      this.incrementViewCount(posts);
      this.isLoadingPosts = false;
    });
  }

  incrementViewCount(posts: Post[]): void {
    posts.forEach(post => {
      if (!this.viewedPosts.has(post.postId)) {
        this.viewedPosts.add(post.postId);
        this.incrementPostView(post.postId);
      }
    })
  }

  incrementPostView(postId: string): void {
    this.postsService.incrementView(postId).then(() => {
      console.log(`Incremented view count for post ${postId}`);
    })
  }

  openProfileEditor(): void {
    this.isProfileEditorOpen = true;
  }
  
  closeProfileEditor(): void {
    this.isProfileEditorOpen = false;
  }
}
