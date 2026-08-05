import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf } from '@angular/common';

interface SidebarLink {
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-agency-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgForOf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class AgencySidebarComponent {
  links: SidebarLink[] = [
    {
      label: 'Kabinet',
      routerLink: '/profile/agency/dashboard',
    },
    {
      label: "E'lonlar",
      routerLink: '/profile/agency',
    },
    {
      label: 'Xodimlar',
      routerLink: '/profile/agency/staff',
    },
    {
      label: 'Tahlil',
      routerLink: '/profile/agency/analytics',
    },
  ];
}
