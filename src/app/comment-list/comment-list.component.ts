import { Component, Input, OnInit } from '@angular/core';
import { Comment, Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.css'
})
export class CommentListComponent implements OnInit{
  @Input() post?: Post;
  @Input() comments: Comment[] = [];
  topComment?: Comment;
  isCommentSectionOpen: boolean = false;

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    if (this.post?.postId) {
      this.postsService.getTopCommentForPost(this.post.postId).subscribe(topComment => {
        this.topComment = topComment;
      })
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }

  toggleCommentSection(): void {
    this.isCommentSectionOpen = !this.isCommentSectionOpen;
  }
}
