import { Component } from '@angular/core';
import { AnnouncementFormComponent } from '@components/announcement/announcement-form/announcement-form.component';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [AnnouncementFormComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent {}
