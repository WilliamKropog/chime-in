import { Component, Input } from '@angular/core';
import { Post } from 'src/interface';
import { RelativeTimePipe } from 'src/pipes/relative-time.pipe';
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post?: Post;

  constructor() {

  }

}
