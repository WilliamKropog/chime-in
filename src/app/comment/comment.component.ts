import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Comment } from 'src/interface';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() comment?: Comment;

  user$ = this.authService.currentUser$;
  userSubscription: Subscription | null = null;

  constructor(private authService: AuthenticationService) {

  }

}
