import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';
import { filter } from 'rxjs/operators';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  isRegisterRoute: boolean = false;

  constructor(public authService: AuthenticationService, private router: Router){
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isRegisterRoute = event.urlAfterRedirects === '/register';
    });
  }
}
