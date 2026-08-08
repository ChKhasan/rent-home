import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnnouncementFormComponent } from '@components/announcement/announcement-form/announcement-form.component';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [AnnouncementFormComponent],
  templateUrl: './edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './edit.component.css',
})
export class EditComponent {}
