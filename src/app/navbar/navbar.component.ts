import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  
  unseenPostsCount: number = 0;
  lastVisitToFollowingPage: Date | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUnseenPostsCount$().subscribe(count => {
      this.unseenPostsCount = count;
    });

    console.log('Number of unseen posts: ', this.unseenPostsCount);

    this.userService.startTrackingUnseenPosts();
  }

  onFollowingClick(): void {
    this.userService.clearUnseenPostsCount();
    this.userService.updateLastVisitToFollowingPage();
  }

}
