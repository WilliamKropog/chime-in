import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Post } from 'src/interface';

@Component({
    selector: 'app-profile-posts',
    templateUrl: './profile-posts.component.html',
    styleUrl: './profile-posts.component.css',
    standalone: false
})
export class ProfilePostsComponent implements OnInit, OnDestroy{
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
