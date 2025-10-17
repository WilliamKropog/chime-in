import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Post } from 'src/interface';

@Component({
    selector: 'app-home-posts',
    templateUrl: './home-posts.component.html',
    styleUrls: ['./home-posts.component.css'],
    standalone: false
})
export class HomePostsComponent implements OnInit, OnDestroy {
  @Input() posts: Post[] = [];
  @Output() deleted = new EventEmitter<string>();

  ngOnInit(): void {
    console.log('HomePostsComponent initialized');
  }

  ngOnDestroy(): void {
    console.log('HomePostsComponent destroyed');
  }

  onPostDeleted(postId: string) {
    this.deleted.emit(postId);
  }
}
