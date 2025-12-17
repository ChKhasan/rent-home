import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, take } from 'rxjs';
import { Location, NgForOf } from '@angular/common';
import { NgIf } from '@angular/common';
import { AgencyAccessService } from '@services/agency-access';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, RouterLinkActive],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css',
})
export class TabComponent implements OnInit {
  public tab: number = 2;
  public isPath!: string;
  public linkOptions: {
    title: string;
    id: number;
    to: string;
    name: string;
  }[] = [];
  private readonly baseLinks = [
    {
      title: "Shaxsiy ma'lumotlarim",
      id: 1,
      to: '/profile',
      name: 'profile',
    },
    {
      title: "Mening e'lonlarim",
      id: 2,
      to: '/profile/announcements',
      name: 'announcements',
    },
    {
      title: 'Mening yozishmalarim',
      id: 3,
      to: '/profile/chat',
      name: 'chat',
    },
    {
      title: 'Agentlik kabineti',
      id: 4,
      to: '/profile/agency',
      name: 'agency',
    },
  ];
  private hasAgencyAccess = false;
  public linksReady = false;

  activeRouteName: string | undefined;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private location: Location,
    private agencyAccessService: AgencyAccessService,
  ) {
    this.isPath = this.location.path();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.activeRouteName = this.router.url;
      this.isPath = this.location.path();
    });
  }

  ngOnInit(): void {
    this.agencyAccessService
      .hasMembership()
      .pipe(take(1))
      .subscribe((hasAccess) => {
        this.hasAgencyAccess = hasAccess;
        this.linksReady = true;
        this.updateLinks();
      });
  }

  private updateLinks() {
    this.linkOptions = this.baseLinks.filter((link) => {
      if (link.name === 'agency') {
        return this.hasAgencyAccess;
      }
      return true;
    });
  }
}
