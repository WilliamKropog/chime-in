import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Comment, Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';

@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html',
    styleUrl: './comment-list.component.css',
    standalone: false
})
export class CommentListComponent implements OnInit {
  @Input() post?: Post;
  @Input() comments: Comment[] = [];
  topComment?: Comment;
  isCommentSectionOpen = false;

  constructor(
    private postsService: PostsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // On the dedicated post page (/post/:postId), start with comments open so the user sees the full discussion
    const url = this.router.url;
    const postPageMatch = /^\/post\/([^/?#]+)/.exec(url);
    if (postPageMatch && postPageMatch[1] === this.post?.postId) {
      this.isCommentSectionOpen = true;
    }
    if (this.post?.postId) {
      this.postsService.getTopCommentForPost(this.post.postId).subscribe(topComment => {
        this.topComment = topComment;
      });
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }

  toggleCommentSection(): void {
    this.isCommentSectionOpen = !this.isCommentSectionOpen;
  }
}
