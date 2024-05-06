import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore } from 'firebase/firestore';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostComponent } from '../post/post.component';
import * as firebase from 'firebase/compat';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  postText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$;

  constructor(
    private authService: AuthenticationService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
  ) { }

  updateCharacterCount(): void {
    this.characterCount = this.postText.length;
  }

  updatePostText(value: string): void {
    this.postText = value;
    this.updateCharacterCount();
  }

  onClose(): void {
    this.isVisible = false;
    this.close.emit();
  }

  submitPost(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const post: PostComponent = {
          content: this.postText,
          authorId: user.uid,
          timestamp: firebase.default.firestore.Timestamp.now()
        };


      }
    })
  }

}
