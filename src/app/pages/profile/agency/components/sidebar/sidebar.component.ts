import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';

interface SidebarLink {
  label: string;
  icon: string;
  routerLink: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-agency-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgForOf, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class AgencySidebarComponent {
  links: SidebarLink[] = [
    {
      label: "E'lonlar",
      icon: 'pi pi-list',
      routerLink: '/profile/agency',
    },
    {
      label: 'Xodimlar',
      icon: 'pi pi-users',
      routerLink: '/profile/agency/staff',
    },
    {
      label: "Agentlik ma'lumotlari",
      icon: 'pi pi-briefcase',
      routerLink: '/profile/agency/info',
    },
    {
      label: 'Statistika',
      icon: 'pi pi-chart-line',
      routerLink: '/profile/agency/analytics',
      disabled: true,
    },
  ];
}
