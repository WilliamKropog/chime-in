import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';
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
    private auth: AngularFireAuth,
    private afs: AngularFirestore,
    private postService: PostsService,
  ) { }

  chimein(): void {
    this.isLoading = true;
    console.log('chimein pending...');

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const body: Post = {
          body: this.postText,
          photoURL: user.photoURL,
          displayName: user.displayName,
          userId: user.uid,
          createdAt: new Date(),
        };

        console.log('saved post profile...')

        if (this.postText.length > 0) {
          this.postService.savePost(body).then(() => {
            this.onClose();
          }).catch(error => {
            console.error('Error saving post: ', error);
          }).finally(() => {
            this.isLoading = false;
          });
        }
      } else {
        console.error('No user is logged in');
        this.isLoading = false;
      }
    })
  }

  // chimein(): void {
  //   this.isLoading = true;
  //   console.log('chimein pending...')

  //   const body: (Post) = {
  //     body: this.postText,
  //     userId: this.authService.loggedInUserId,
  //     createdAt: new Date()
  //   };

  //   console.log('saved post profile...')

  //   if (this.postText.length > 0) {
  //     this.postService.savePost(body);
  //     this.onClose();
  //   }
  // }

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
}
