import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';


interface SidebarLink {
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-agency-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
