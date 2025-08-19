import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user.service';

@Component({
    selector: 'app-not-following-posts',
    templateUrl: './not-following-posts.component.html',
    styleUrl: './not-following-posts.component.css',
    standalone: false
})
export class NotFollowingPostsComponent implements OnInit{
  recommendedUsers: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRecommendedProfiles();
  }

  loadRecommendedProfiles(): void {
    this.userService.getMultipleRandomRecommendedUsers(3).subscribe(users => {
      this.recommendedUsers = users;
    })
  }

}
