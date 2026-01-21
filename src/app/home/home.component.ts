import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  mostRecentPosts: Post[] = [];
  viewedPosts: Set<string> = new Set();
  isLoadingPosts = false;
  loadError: string | null = null;
  scrollTimeout: any = null;
  scrollThreshold = 200;

  private subs = new Subscription();

  constructor(private postsService: PostsService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadInitialPosts();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }

  onPostDeleted(postId: string) {
    this.mostRecentPosts = this.mostRecentPosts.filter(p => p.postId !== postId);
  }

  private mergeUniqueById(existing: Post[], incoming: Post[]): Post[] {
    const seen = new Set(existing.map(p => p.postId));
    const dedupIncoming = incoming.filter(p => !seen.has(p.postId));
    return [...existing, ...dedupIncoming];
  }

  loadInitialPosts() {
    this.isLoadingPosts = true;
    this.loadError = null;
    this.postsService.getMostRecentPosts().subscribe(posts => {
      this.mostRecentPosts = posts;
      this.isLoadingPosts = false;
    }, err => {
      console.error('Failed to load posts:', err);
      this.loadError = 'Failed to load posts. If you are using the Firebase emulators, you may simply have no local data yet.';
      this.isLoadingPosts = false;
    });
  }

  loadMorePosts() {
    if (this.isLoadingPosts) return;

    this.isLoadingPosts = true;
    const s = this.postsService.getMorePosts().subscribe({
      next: posts => {
        this.mostRecentPosts = this.mergeUniqueById(this.mostRecentPosts, posts);
        this.isLoadingPosts = false;
      },
      error: () => (this.isLoadingPosts = false)
    });
    this.subs.add(s);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const fullHeight = document.documentElement.scrollHeight;
        if ((fullHeight - scrollPosition) < this.scrollThreshold && !this.isLoadingPosts) {
          this.loadMorePosts();
        }
      });
    }, 200);
  }

  // Views are counted on the post page (open), not when a feed renders.
}
