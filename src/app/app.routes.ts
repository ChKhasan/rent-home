import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CreateComponent } from './pages/announcement/create/create.component';
import { EditComponent } from './pages/announcement/edit/edit.component';
import { ProfileLayoutComponent } from './shared/components/layouts/profile-layout/profile-layout.component';
import { AnnouncementsComponent } from './pages/profile/announcements/announcements.component';
import { ListComponent } from './pages/announcements/list/list.component';
import { ProfileComponent } from './pages/profile/profile/profile.component';
import { ViewComponent } from './pages/announcements/view/view.component';
import { MapComponent } from './pages/map/map.component';
import { MapLayoutComponent } from './shared/components/layouts/map-layout/map-layout.component';
import { LayoutComponent } from './shared/components/layouts/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { LikesComponent } from './pages/likes/likes.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ProfileAnnouncementComponent } from './pages/profile/profile-announcement/profile-announcement.component';
import { AgencyComponent } from './pages/profile/agency/agency.component';
import { AgencyDashboardComponent } from './pages/profile/agency/pages/dashboard/dashboard.component';
import { AgencyAnnouncementsComponent } from './pages/profile/agency/pages/announcements/announcements.component';
import { AgencyAnalyticsComponent } from './pages/profile/agency/pages/analytics/analytics.component';
import { AgencyInfoComponent } from './pages/profile/agency/pages/info/info.component';
import { AgencyStaffComponent } from './pages/profile/agency/pages/staff/staff.component';
import { agencyGuard } from './core/guards/agency.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'announcements', component: ListComponent },
      { path: 'announcements/:id', component: ViewComponent },
      { path: 'likes', component: LikesComponent },
      {
        path: 'map',
        component: MapLayoutComponent,
        children: [{ path: '', component: MapComponent }],
      },
    ],
  },
 
  {
    path: 'profile',
    component: ProfileLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ProfileComponent },
      { path: 'create', component: CreateComponent },
      { path: 'announcements/:id', component: EditComponent },
      { path: 'announcements-view/:id', component: ProfileAnnouncementComponent },
      { path: 'announcements', component: AnnouncementsComponent },
      { path: 'chat', component: ChatComponent },
      {
        path: 'agency',
        component: AgencyComponent,
        canActivate: [agencyGuard],
        children: [
          { path: '', component: AgencyAnnouncementsComponent },
          { path: 'dashboard', component: AgencyDashboardComponent },
          { path: 'staff', component: AgencyStaffComponent },
          { path: 'info', component: AgencyInfoComponent },
          { path: 'analytics', component: AgencyAnalyticsComponent },
        ],
      },
    ],
  },
];
