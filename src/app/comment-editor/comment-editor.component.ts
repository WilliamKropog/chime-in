import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Comment, Post } from 'src/interface';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrl: './comment-editor.component.css'
})
export class CommentEditorComponent implements OnInit, OnDestroy{
  @Input() postId!: string;
  @Input() post?: Post;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  isLoading: boolean = false;
  commentText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$;
  userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthenticationService,
    private postService: PostsService,
  ) { }

  ngOnInit(): void {
    console.log('CommentEditor initialized with postId:', this.postId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && !changes['postId'].isFirstChange()) {
      console.log('CommentEditor received new postId:', this.postId);
    }
  }

  comment(): void {
    this.isLoading = true;

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && this.postId) {
        const body: Comment = {
          body: this.commentText,
          photoURL: user.photoURL,
          displayName: user.displayName,
          userId: user.uid,
          createdAt: new Date(),
          likeCount: 0,
          dislikeCount: 0,
          replyCount: 0,
          commentId: '',
          postId: this.postId
        }; 


        if (this.commentText.length > 0) {

          this.postService.saveComment(this.postId, body).then((commentId) => {
            body.commentId = commentId;
            console.log('Comment successfully saved with ID:', commentId);
          }).catch(error => {
            console.error('Error saving comment: ', error);
            this.post!.commentCount!--;
          }).finally(() => {
            this.isLoading = false;
            this.commentText = '';
            this.unsubscribeUser();
            this.close.emit();
          });
        } else {
          console.error('Comment text is empty');
          this.isLoading = false;
        }
      } else {
        console.error('No user is logged in or postId is undefined');
        this.isLoading = false;
      }
    })
  }


  updateCharacterCount(): void {
    this.characterCount = this.commentText.length;
  }

  updateCommentText(value: string): void {
    this.commentText = value;
    this.updateCharacterCount();
  }

  unsubscribeUser(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeUser();
  }

}
