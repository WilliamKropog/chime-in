import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';

@Component({
    selector: 'app-post-page',
    templateUrl: './post-page.component.html',
    styleUrl: './post-page.component.css',
    standalone: false
})
export class PostPageComponent implements OnInit {
  post: Post | undefined = undefined;
  isLoading = true;
  notFound = false;

  constructor(private route: ActivatedRoute, private postsService: PostsService) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('postId');
    if (postId) {
      // A "view" should be counted on opening the post page (not on feed load).
      this.postsService.incrementView(postId);
      this.loadPost(postId);
    } else {
      this.isLoading = false;
      this.notFound = true;
    }
  }

  loadPost(postId: string): void {
    this.postsService.getPostById(postId).subscribe((post) => {
      this.post = post;
      this.isLoading = false;
      this.notFound = !post;
    });
  }

}

