import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase/auth';
import { of, switchMap, merge, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/services/authentication.service';
import { UserService } from 'src/services/user.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: false
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
  currentUserId: string = ''; 
  loggedInUserId: string = ''; 
  userPhotoUrl: string = 'assets/images/png-transparent-default-avatar.png';

  /** Emits when profile data is refreshed after editor close (bio, background, pfp). */
  private profileRefresh$ = new Subject<any>();

  // Initial load from route; merged with profileRefresh$ so template updates after editor save.
  private user$ = this.route.paramMap.pipe(
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
          this.userPhotoUrl = this.userData.profileImageURL || 'assets/images/png-transparent-default-avatar.png';
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

  /** Template uses this so bio/background/pfp update when editor closes. */
  displayUser$ = merge(this.user$, this.profileRefresh$);

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private postsService: PostsService,
    private route: ActivatedRoute,
    private toast: HotToastService
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

  private dedupePostsById(posts: Post[]): Post[] {
    const seen = new Set<string>();
    return posts.filter(p => {
      const id = p.postId ?? (p as any).id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  loadUserPosts(userId: string): void {
    this.isLoadingPosts = true;
    this.postsService.getUserPosts(userId).subscribe((posts) => {
      this.userPosts = this.dedupePostsById(posts ?? []);
      this.isLoadingPosts = false;
    });
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
      this.userPosts = this.dedupePostsById([...this.userPosts, ...(posts ?? [])]);
      this.isLoadingPosts = false;
    });
  }

  // Views are counted on the post page (open), not when a profile feed renders.

  //Following Functions:
  checkFollowingStatus(): void {
    if (this.currentUserId && this.loggedInUserId) {
      this.userService.isFollowing(this.loggedInUserId, this.currentUserId).subscribe(isFollowing => {
        this.isFollowing = isFollowing;
      });
    }
  }

  follow(): void {
    if (this.currentUserId && this.loggedInUserId) {
      this.userService.followUser(this.currentUserId, this.loggedInUserId).then(() => {
        this.isFollowing = true;
        const handle = this.userData?.username ?? this.username;
        this.toast.success(handle ? `Now following @${handle}` : 'Follow successful');
      });
    }
  }

  unfollow(): void {
    if (this.currentUserId && this.loggedInUserId) {
      this.userService.unfollowUser(this.currentUserId, this.loggedInUserId).then(() => {
        this.isFollowing = false;
        const handle = this.userData?.username ?? this.username;
        this.toast.success(handle ? `Unfollowed @${handle}` : 'Unfollow successful');
      });
    }
  }

  //Profile Editor Modal functions:
  openProfileEditor(): void {
    this.isProfileEditorOpen = true;
  }

  /** Refetch profile from Firestore so bio, background, and pfp update after editor save. */
  refreshProfileData(): void {
    if (!this.currentUserId || !this.userData) return;
    this.userService.getUserProfile(this.currentUserId).pipe(take(1)).subscribe((data: any) => {
      const merged = { ...this.userData, ...data };
      this.userData = merged;
      this.userPhotoUrl = merged?.profileImageURL || 'assets/images/png-transparent-default-avatar.png';
      this.hasBio = !!merged?.bio;
      this.hasBackgroundImage = !!merged?.backgroundImageURL;
      this.profileRefresh$.next(merged);
    });
  }

  closeProfileEditor(): void {
    this.isProfileEditorOpen = false;
    this.refreshProfileData();
  }
}
