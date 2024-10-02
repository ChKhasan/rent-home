import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { IAnnouncementInfo } from '@services/interfaces';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  @Input() announcement!: IAnnouncementInfo;
}
