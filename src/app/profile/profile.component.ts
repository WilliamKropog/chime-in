import { Component, HostListener, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class ProfileComponent implements OnInit{

  hasBackgroundImage: boolean = false;
  hasBio: boolean = false;
  isProfileEditorOpen: boolean = false;
  isFollowing: boolean = false;
  userPosts: Post[] = [];
  username: string = '';
  userData: any = null;
  viewedPosts: Set<string> = new Set();
  isLoadingPosts: boolean = false;
  scrollTimeout: any = null;
  scrollThreshHold: number = 200;
  currentUserId: string = ''; //ID of User who's profile page is being viewed.
  loggedInUserId: string = ''; //ID of User who is currently logged in.
  profileUserId: string = ''; //Will be deleted as it is not needed.
  userPhotoUrl: string = 'assets/images/png-transparent-default-avatar.png';

  //User Subscription:
  //Pulls User from URL and loads their profile.
  //If User exists, pull their data from Firebase Auth and combine it with User data
  // from Firebase database. 

  user$ = this.route.paramMap.pipe(
    switchMap(params => {
      this.username = params.get('username') || '';
      if (!this.username || typeof this.username !== 'string' || this.username.trim() === '') {
        console.error('Invalid username provided: Profile.ts');
        return of(null);
      }
      return this.userService.getUserByUsername(this.username);
    }),
    switchMap((userData: any) => {
      if (userData && userData.length > 0) {
        this.userData = userData[0];
        this.currentUserId = this.userData.uid || '';
        this.hasBackgroundImage = !!this.userData.backgroundImageURL;
        this.hasBio = !!this.userData.bio;

        if (this.currentUserId) {
          this.loadUserProfileImage(this.currentUserId);
          this.loadUserPosts(this.currentUserId);
        } else {
          console.error('User ID is missing: Profile.ts')
        }

        return of(this.userData);
      } else {
        console.error('User data not found for username:', this.username);
        return of(null);
      }
    })
  );

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private postsService: PostsService,
    private route: ActivatedRoute
  ){}

  //Grab the logged-in User's UserID and store it.
  ngOnInit(): void {
    this.authService.currentUser$.subscribe((authUser: User | null) => {
      if (authUser) {
        this.loggedInUserId = authUser.uid;
        this.user$.subscribe(() => {
          if (this.currentUserId) {
            this.checkFollowingStatus();
          }
        })
      }
    })
  }

  loadUserPosts(userId: string): void {
    this.isLoadingPosts = true;
    this.postsService.getUserPosts(userId).subscribe((posts) => {
      this.userPosts = posts;
      this.incrementViewCount(posts);
      this.isLoadingPosts = false;
    });
  }

  loadUserProfileImage(uid: string): void {
    this.userService.getUserProfileImageUrl(uid).subscribe((url: string) => {
      this.userPhotoUrl = url;
    })
  }

  //Automatically load more posts when scrolled to the bottom of the page.
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

  //Following Functions:
  checkFollowingStatus(): void {
    if (this.currentUserId && this.loggedInUserId) {
      this.userService.isFollowing(this.loggedInUserId, this.currentUserId).subscribe(isFollowing => {
        this.isFollowing = isFollowing;
      });
    }
  }

  follow(): void {
    console.log('Current User ID:', this.currentUserId);
    console.log('Logged-in User ID:', this.loggedInUserId);
    if (this.currentUserId && this.loggedInUserId) {
      console.log('Calling followUser function.');
      this.userService.followUser(this.currentUserId, this.loggedInUserId).then(() => {
        this.isFollowing = true;
      })
    }
  }

  unfollow(): void {
    if (this.currentUserId && this.loggedInUserId) {
      console.log('Calling unfollowUser function.');
      this.userService.unfollowUser(this.currentUserId, this.loggedInUserId).then(() => {
        this.isFollowing = false;
      })
    }
  }

  //Profile Editor Modal fucntions:
  openProfileEditor(): void {
    this.isProfileEditorOpen = true;
  }
  
  closeProfileEditor(): void {
    this.isProfileEditorOpen = false;
  }
}
