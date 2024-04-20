import { Component } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css'
})
export class TabComponent {
  public tab: number = 2;
  public linkOptions = [
    {
      title: "Shaxsiy ma'lumotlarim",
      id: 1,
      to: "/profile",
      name: "profile",
    },
    {
      title: "Mening e'lonlarim",
      id: 2,
      to: "/profile/announcements",
      name: "profile-announcements",
    },
  ];
  activeRouteName: string | undefined;
  constructor(public router: Router,public route: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeRouteName = this.router.url;
      console.log(this.activeRouteName)
    });
  }
}
