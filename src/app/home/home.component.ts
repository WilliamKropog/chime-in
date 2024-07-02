import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  mostRecentPosts: Post[] = [];
  private postsSubscription: Subscription | undefined;

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    console.log('HomeComponent initialized');
    this.postsSubscription = this.postsService.getMostRecentPosts().subscribe(posts => {
      console.log('getMostRecentPosts called');
      this.mostRecentPosts = posts;
    });
  }

  ngOnDestroy(): void {
    console.log('HomeComponent destroyed');
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
  }
}
