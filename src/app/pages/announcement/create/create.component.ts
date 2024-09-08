import { Component, ViewChild } from '@angular/core';
import { AnnouncementFormComponent } from '@components/announcement/announcement-form/announcement-form.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [AnnouncementFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent {}
