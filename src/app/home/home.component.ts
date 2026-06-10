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
  isLoadingInitial = false;
  isLoadingMore = false;
  hasMorePosts = true;
  loadError: string | null = null;
  scrollTimeout: any = null;
  scrollThreshold = 200;
  private readonly pageSize = 10;

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
    this.isLoadingInitial = true;
    this.hasMorePosts = true;
    this.loadError = null;
    const s = this.postsService.getMostRecentPosts().subscribe({
      next: posts => {
        this.mostRecentPosts = this.mergeFeedFirstPage(posts);
        this.hasMorePosts = posts.length >= this.pageSize;
        this.isLoadingInitial = false;
      },
      error: err => {
        console.error('Failed to load posts:', err);
        this.loadError = 'Failed to load posts. If you are using the Firebase emulators, you may simply have no local data yet.';
        this.isLoadingInitial = false;
      }
    });
    this.subs.add(s);
  }

  /** Keep scroll-loaded pages when the live first page updates (e.g. new post). */
  private mergeFeedFirstPage(firstPage: Post[]): Post[] {
    if (this.mostRecentPosts.length <= this.pageSize) {
      return firstPage;
    }
    const firstPageIds = new Set(firstPage.map(p => p.postId));
    const olderLoaded = this.mostRecentPosts.filter(p => !firstPageIds.has(p.postId));
    return this.mergeUniqueById(firstPage, olderLoaded);
  }

  loadMorePosts() {
    if (this.isLoadingInitial || this.isLoadingMore || !this.hasMorePosts) return;

    this.isLoadingMore = true;
    const previousCount = this.mostRecentPosts.length;
    const s = this.postsService.getMorePosts().subscribe({
      next: posts => {
        if (!posts.length) {
          this.hasMorePosts = false;
        } else {
          this.mostRecentPosts = this.mergeUniqueById(this.mostRecentPosts, posts);
          const addedCount = this.mostRecentPosts.length - previousCount;
          if (addedCount === 0 || posts.length < this.pageSize) {
            this.hasMorePosts = false;
          }
        }
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoadingMore = false;
      }
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
        if ((fullHeight - scrollPosition) < this.scrollThreshold && !this.isLoadingInitial && !this.isLoadingMore && this.hasMorePosts) {
          this.loadMorePosts();
        }
      });
    }, 200);
  }

  // Views are counted on the post page (open), not when a feed renders.
}
