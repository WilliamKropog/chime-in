import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post, User } from 'src/interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/services/user.service';
import { combineLatest, from, map, Observable, shareReplay } from 'rxjs';
import { PostsService } from 'src/services/posts.service';
import { HotToastService } from '@ngneat/hot-toast';

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
  @Output() deleted = new EventEmitter<string>();

    vm$!: Observable<{
      showEdit: boolean;
      showReport: boolean;
      showBlock: boolean;
      showBanUser: boolean;
      showBanPost: boolean;
      showDelete: boolean;
      showPromote: boolean;
      showDemote: boolean;
    }>;

  constructor(
    private userService: UserService, 
    private postsService: PostsService,
    private toast: HotToastService
  ) {}

  ownerIsMod$!: Observable<boolean>;
  ownerIsAdmin$!: Observable<boolean>;

  ngOnChanges(): void {
    this.ownerIsMod$ = this.userService.user$(this.postOwnerId).pipe(map(u => !!u?.isMod));
    this.ownerIsAdmin$ = this.userService.user$(this.postOwnerId).pipe(map(u => !!u?.isAdmin));

    this.vm$ = combineLatest([this.ownerIsAdmin$, this.ownerIsMod$]).pipe(
      map(([ownerIsAdmin, ownerIsMod]) => {
        const isOwnPost = this.currentUser?.uid === this.postOwnerId;
        const isAdmin   = !!this.currentUser?.isAdmin;
        const isMod     = !!this.currentUser?.isMod;
        const canBan    = isAdmin || isMod;

        return {
          showEdit:    isOwnPost,
          showReport:  !isOwnPost,
          showBlock:   !isOwnPost,
          showBanUser: canBan && !isOwnPost && !ownerIsAdmin && (isAdmin || !ownerIsMod),
          showBanPost: canBan && !isOwnPost && !ownerIsAdmin && (isAdmin || !ownerIsMod),
          showDelete:  isOwnPost,
          showPromote: isAdmin && !isOwnPost && !ownerIsMod,
          showDemote:  isAdmin && !isOwnPost && ownerIsMod,
        };
      }),
      shareReplay(1)
    );
  }

  onPromoteToMod(): void {
  if (!this.isAdmin) return;
  from(this.userService.promoteToMod(this.postOwnerId))
    .pipe(this.toast.observe({
      loading: 'Promoting user to mod...',
      success: 'User promoted!',
      error: 'Error promoting user.'
    }))
    .subscribe({ next: () => this.close.emit() });
  }

  onDemoteFromMod(): void {
    if (!this.isAdmin) return;
    from(this.userService.demoteFromMod(this.postOwnerId))
      .pipe(this.toast.observe({
        loading: 'Demoting user from mod...',
        success: 'User demoted!',
        error: 'Error demoting user.'
    }))
    .subscribe({ next: () => this.close.emit() });
  }

  onBanUser(): void {
    from(this.userService.banUser(this.postOwnerId))
      .pipe(this.toast.observe({ 
        loading: 'Banning user...', 
        success: 'User banned.', 
        error: 'Ban failed.' }))
      .subscribe({ next: () => this.close.emit() });
  }

  async onDeleteOwnPost(): Promise<void> {
    if (!this.isOwnPost || !this.postId) return;
    await this.postsService.deletePost(this.postId);
    this.deleted.emit(this.postId);
    this.close.emit();
  }

  async onBanPost(): Promise<void> {
    if (!(this.isAdmin || this.isMod) || !this.postId) return;
    await this.postsService.deletePost(this.postId);
    this.deleted.emit(this.postId);
    this.close.emit();
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
