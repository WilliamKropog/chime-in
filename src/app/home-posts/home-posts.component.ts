import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/interface';

@Component({
  selector: 'app-home-posts',
  templateUrl: './home-posts.component.html',
  styleUrls: ['./home-posts.component.css']
})
export class HomePostsComponent implements OnInit, OnDestroy {
  @Input() posts: Post[] = [];

  ngOnInit(): void {
    console.log('HomePostsComponent initialized');
  }

  ngOnDestroy(): void {
    console.log('HomePostsComponent destroyed');
  }

  trackByPostId(index: number, post: Post): string {
    return post.postId
  }
}
