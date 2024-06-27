import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import {Announcement} from "@services/interfaces";

@Component({
  selector: 'app-about',
  standalone: true,
    imports: [
        NgIf
    ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  @Input() announcement!: Announcement;
}
