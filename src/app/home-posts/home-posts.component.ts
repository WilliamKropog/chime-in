import { Component, Input } from '@angular/core';
import { Post } from 'src/interface';

@Component({
  selector: 'app-home-posts',
  templateUrl: './home-posts.component.html',
  styleUrls: ['./home-posts.component.css']
})
export class HomePostsComponent {
  @Input() posts: Post[] = [];
}
