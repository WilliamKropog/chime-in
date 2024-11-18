import { Component, OnDestroy, OnInit, HostListener, Input } from '@angular/core';
import { Post } from 'src/interface';

@Component({
  selector: 'app-following-posts',
  templateUrl: './following-posts.component.html',
  styleUrl: './following-posts.component.css'
})
export class FollowingPostsComponent implements OnInit, OnDestroy{
  @Input() posts: Post[] = [];

  ngOnInit(): void {
    console.log('FollowingPosts initialized');
  }

  ngOnDestroy(): void {
    console.log('FollowingPosts destroyed');
  }

  trackbyPostId(index: number, post: Post): string {
    return post.postId;
  }

}
