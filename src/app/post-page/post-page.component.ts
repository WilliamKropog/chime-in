import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.css'
})
export class PostPageComponent implements OnInit {
  post: Post | undefined = undefined;

  constructor(private route: ActivatedRoute, private postsService: PostsService) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('postId');
    if (postId) {
      this.loadPost(postId);
    }
  }

  loadPost(postId: string): void {
    this.postsService.getPostById(postId).subscribe((post) => {
      this.post = post;
    });
  }

}

