import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent {

  user$ = this.authService.currentUser$;

  constructor(public authService: AuthenticationService, private router: Router){

  }

  logout(){
    this.authService.logout().subscribe(() => {
      this.router.navigate(['']);
    });
  }


}
