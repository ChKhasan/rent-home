import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { agencyGuard } from './core/guards/agency.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layouts/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
      { path: 'announcements', loadComponent: () => import('./pages/announcements/list/list.component').then((m) => m.ListComponent) },
      { path: 'announcements/:id', loadComponent: () => import('./pages/announcements/view/view.component').then((m) => m.ViewComponent) },
      { path: 'likes', loadComponent: () => import('./pages/likes/likes.component').then((m) => m.LikesComponent) },
      {
        path: 'map',
        loadComponent: () => import('./shared/components/layouts/map-layout/map-layout.component').then((m) => m.MapLayoutComponent),
        children: [{ path: '', loadComponent: () => import('./pages/map/map.component').then((m) => m.MapComponent) }],
      },
    ],
  },
  {
    path: 'profile',
    loadComponent: () => import('./shared/components/layouts/profile-layout/profile-layout.component').then((m) => m.ProfileLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/profile/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'create', loadComponent: () => import('./pages/announcement/create/create.component').then((m) => m.CreateComponent) },
      { path: 'announcements/:id', loadComponent: () => import('./pages/announcement/edit/edit.component').then((m) => m.EditComponent) },
      { path: 'announcements-view/:id', loadComponent: () => import('./pages/profile/profile-announcement/profile-announcement.component').then((m) => m.ProfileAnnouncementComponent) },
      { path: 'announcements', loadComponent: () => import('./pages/profile/announcements/announcements.component').then((m) => m.AnnouncementsComponent) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then((m) => m.ChatComponent) },
      {
        path: 'agency',
        loadComponent: () => import('./pages/profile/agency/agency.component').then((m) => m.AgencyComponent),
        canActivate: [agencyGuard],
        children: [
          { path: '', loadComponent: () => import('./pages/profile/agency/pages/announcements/announcements.component').then((m) => m.AgencyAnnouncementsComponent) },
          { path: 'dashboard', loadComponent: () => import('./pages/profile/agency/pages/dashboard/dashboard.component').then((m) => m.AgencyDashboardComponent) },
          { path: 'staff', loadComponent: () => import('./pages/profile/agency/pages/staff/staff.component').then((m) => m.AgencyStaffComponent) },
          { path: 'info', loadComponent: () => import('./pages/profile/agency/pages/info/info.component').then((m) => m.AgencyInfoComponent) },
          { path: 'analytics', loadComponent: () => import('./pages/profile/agency/pages/analytics/analytics.component').then((m) => m.AgencyAnalyticsComponent) },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
