import { Component, Input } from '@angular/core';
import { Post } from 'src/interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
