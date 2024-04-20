import {Component, OnInit} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {HeaderComponent} from "./shared/components/layouts/header/header.component";
import {FooterComponent} from "./shared/components/layouts/footer/footer.component";
import {LikesService} from "./core/services/likes/likes.service";
import {AuthService} from "./core/services/auth/auth.service";
import {environment} from "../environments/environment";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(
    private likesService: LikesService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.authService.authHandler();
      const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
      Boolean(AUTH_TOKEN) ? this.POST_GET_LIKES():this.likesService.reloadLikes();
    }
  }

  POST_GET_LIKES() {
    let localLikes = JSON.parse(localStorage.getItem(environment.storeLikes) as string);
    if (localLikes && localLikes.length > 0)
      Promise.all(localLikes.map((item: any) => this.__POST_LIKE({announcement: item}))).then(r => {});
    this.__GET_LIKE();
  }

  __POST_LIKE(data: any) {
    this.likesService.post(data);
  }

  __GET_LIKE() {
    this.likesService.get().subscribe((response) => {
      const userLikes = response?.map((item: any) => item.announcement?.id);
      this.likesService.handleUserLikes(userLikes);
      localStorage.removeItem(environment.storeLikes);
    });
  }
}
