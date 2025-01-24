import { Component } from "@angular/core";
import { ViewPageComponent } from "../../../shared/components/announcement/view-page/view-page.component";

@Component({
  selector: "app-profile-announcement",
  standalone: true,
  imports: [ViewPageComponent],
  templateUrl: "./profile-announcement.component.html",
  styleUrl: "./profile-announcement.component.css",
})
export class ProfileAnnouncementComponent {}
