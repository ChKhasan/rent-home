import {Component, Input} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {LikesService} from "@services/likes";
import {AuthService} from "@services/auth";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {finalize} from "rxjs";
import {TooltipModule} from "primeng/tooltip";

@Component({
  selector: 'app-announcements-card',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgOptimizedImage,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './announcements-card.component.html',
  styleUrl: './announcements-card.component.css'
})
export class AnnouncementsCardComponent{
  @Input() announcement: any;
  public loading: boolean = false
  constructor(
    public likesService: LikesService,
    private authService: AuthService
  ) {
  }

  check_auth(id: number) {
    this.authService.auth ? this.check_likes(id) : this.likesService.likeHandle(id);
  }
  check_likes(id: number) {
    const data = {
      announcement: id,
    };
    this.likesService.likes.includes(id) ? this.__DELETE_LIKE({ id: id }) : this.__POST_LIKE(data);
  }
  __DELETE_LIKE(payload: {id: number}) {
    this.loading = true
    this.likesService.delete(payload).pipe(finalize(() => this.__GET_LIKES())).subscribe((res) => {
    });
  }
  __POST_LIKE(payload: { announcement: number }) {
    this.loading = true;
    this.likesService.post(payload).pipe(finalize(() => this.__GET_LIKES())).subscribe((res) => {
    });
  }
  __GET_LIKES() {
    this.likesService.get()
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
      const userLikes = response.map((item: any) => item.announcement?.id);
      this.likesService.handleUserLikes(userLikes);
    })
  }

}
