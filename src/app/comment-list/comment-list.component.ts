import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comment, Post } from 'src/interface';
import { PostsService } from 'src/services/posts.service';

@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html',
    styleUrl: './comment-list.component.css',
    standalone: false
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() post?: Post;
  @Input() comments: Comment[] = [];
  topComment?: Comment;
  isCommentSectionOpen = false;
  private topCommentSubscription?: Subscription;

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
      this.topCommentSubscription = this.postsService.getTopCommentForPost(this.post.postId).subscribe(topComment => {
        this.topComment = topComment;
      });
    }
  }

  ngOnDestroy(): void {
    this.topCommentSubscription?.unsubscribe();
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }

  toggleCommentSection(): void {
    this.isCommentSectionOpen = !this.isCommentSectionOpen;
  }
}
