import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post, User } from 'src/interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

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
