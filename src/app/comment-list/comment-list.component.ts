import { Component, Input } from '@angular/core';
import { Comment } from 'src/interface';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.css'
})
export class CommentListComponent {
  @Input() comments: Comment[] = [];
  isCommentSectionOpen: boolean = false;

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }

  toggleCommentSection(): void {
    this.isCommentSectionOpen = !this.isCommentSectionOpen;
  }
}
