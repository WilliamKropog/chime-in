import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';
import { UserService } from 'src/services/user.service';
import { filter, switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';


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

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private userService: UserService
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isRegisterRoute = event.urlAfterRedirects === '/register';
    });

    this.authService.currentUser$.pipe(
      filter((u) => !!u && !!u.photoURL),
      distinctUntilChanged((a, b) => a?.uid === b?.uid),
      switchMap((user) =>
        from(this.userService.syncAuthPhotoToFirestoreIfMissing(user!)).pipe(
          catchError(() => of(undefined))
        )
      )
    ).subscribe();
  }
}
