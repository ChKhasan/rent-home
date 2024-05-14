import { Component } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {filter} from "rxjs";
import {Location, NgForOf} from "@angular/common";

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css'
})
export class TabComponent {
  public tab: number = 2;
  public isPath!: string
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
      name: "announcements",
    },
    {
      title: "Mening yozishmalarim",
      id: 3,
      to: "/profile/chat",
      name: "chat",
    },
  ];
  activeRouteName: string | undefined;
  constructor(public router: Router,
              public route: ActivatedRoute,
              private location: Location) {
    this.isPath = this.location.path()

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeRouteName = this.router.url;
      this.isPath = this.location.path()
    });
  }
}
