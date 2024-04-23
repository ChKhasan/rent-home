import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-subway-icon',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './subway-icon.component.html',
  styleUrl: './subway-icon.component.css'
})
export class SubwayIconComponent {
  @Input() showSubway!: boolean;
}
