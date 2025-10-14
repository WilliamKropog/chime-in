import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post, User } from 'src/interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/services/user.service';
import { map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-post-menu',
  templateUrl: './post-menu.component.html',
  styleUrl: './post-menu.component.css',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatListModule]
})
export class PostMenuComponent {
  @Input({ required: true }) postOwnerId!: string;
  @Input({ required: true }) currentUser!: Pick<User, 'uid' | 'isAdmin' | 'isMod'>;
  @Input() postId!: string;
  @Input() post?: Post;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  ownerIsMod$!: Observable<boolean>;

  ngOnChanges(): void {
    this.ownerIsMod$ = this.userService.user$(this.postOwnerId).pipe(
      map(u => !!u?.isMod),
      shareReplay(1)
    )
  }

  async onPromoteToMod(): Promise<void> {
    if (!this.isAdmin) return;
    try {
      await this.userService.promoteToMod(this.postOwnerId);
      console.log("User successfully promoted to mod.");
      this.close.emit();
    } catch (e) {
      console.error('Promote failed', e);
    }
  }

  async onDemoteFromMod(): Promise<void> {
    if (!this.isAdmin) return;
    try {
      await this.userService.demoteFromMod(this.postOwnerId);
      console.log("User successfully demoted from mod.");
      this.close.emit();
    } catch (e) {
      console.error('Demote failed', e);
    }
  }

  get isOwnPost()  { return this.currentUser?.uid === this.postOwnerId; }
  get isAdmin()    { return !!this.currentUser?.isAdmin; }
  get isMod()      { return !!this.currentUser?.isMod; }
  get canEdit()    { return this.isOwnPost; }
  get canDelete()  { return this.isOwnPost; }
  get canPromote() { return this.isAdmin; }
  get canReport()  { return !this.isOwnPost }
  get canBlock()   { return !this.isOwnPost }
  get canBan()     { return this.isAdmin || this.isMod; }
  
}
