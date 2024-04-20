import { Component } from '@angular/core';
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-anouncement-map-card',
  standalone: true,
    imports: [
        TagModule
    ],
  templateUrl: './anouncement-map-card.component.html',
  styleUrl: './anouncement-map-card.component.css'
})
export class AnouncementMapCardComponent {
  announcement = {
    conditioner: '',
    washing_machine: '',
    title: ''
  };

}
