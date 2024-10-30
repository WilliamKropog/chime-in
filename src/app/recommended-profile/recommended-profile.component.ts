import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-recommended-profile',
  templateUrl: './recommended-profile.component.html',
  styleUrl: './recommended-profile.component.css'
})
export class RecommendedProfileComponent implements OnInit{

  recommendedUser: any = null;
  backgroundImageUrl: string | null = null;
  profileImageUrl: string = 'assets/images/png-transparent-default-avatar.png';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRecommendedUser();
  }

  loadRecommendedUser(): void {
    this.userService.getRandomRecommendedUser().subscribe(user => {
      if (user) {
        this.recommendedUser = user;
        if (user.backgroundImageURL) {
          this.backgroundImageUrl = user.backgroundImageURL;
          console.log(this.backgroundImageUrl);
        }
        this.userService.getUserProfileImageUrl(user.id).subscribe(imageUrl => {
          this.profileImageUrl = imageUrl;
        });
      }
    });
  }

}
