import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';
import { PostComponent } from '../post/post.component';
import { Post } from '../../interface';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  isLoading: boolean = false;
  postText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$;

  constructor(
    private authService: AuthenticationService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private postService: PostsService,
  ) { }

  chimein(): void {
    this.isLoading = true;
    console.log('chimein pending...')

    const body: (Post) = {
      body: this.postText,
      userId: this.authService.loggedInUserId,
      createdAt: new Date()
    };

    console.log('saved post profile...')

    this.postService.savePost(body);

    // this.postService.savePost(body).then(() => {
    //   this.isLoading = false;
    //   this.postText = '';
    //   console.log('chimein successful');
    // }).catch(() => {
    //   this.isLoading = false;
    // })
  }

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
    console.log('Post Modal closed.')
  }

  // submitPost(): void {
  //   this.afAuth.authState.subscribe(user => {
  //     if (user) {
  //       const post: PostComponent = {
  //         content: this.postText,
  //         authorId: user.uid,
  //         timestamp: firebase.default.firestore.Timestamp.now()
  //       };


  //     }
  //   })
  // }

}
