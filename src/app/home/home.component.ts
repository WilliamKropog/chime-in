import { Component, OnInit } from '@angular/core';
import { PostsService } from 'src/services/posts.service';
import { Post } from 'src/interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  mostRecentPost: Post | undefined;
  mostRecentPosts: Post[] = [];

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    this.postsService.getMostRecentPost().subscribe(post => {
      this.mostRecentPost = post;
    })

    this.postsService.getMostRecentPosts().subscribe(posts => {
      this.mostRecentPosts = posts;
    })
  }

}
