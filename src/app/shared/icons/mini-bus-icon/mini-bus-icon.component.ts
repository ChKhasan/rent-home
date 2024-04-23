import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-mini-bus-icon',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './mini-bus-icon.component.html',
  styleUrl: './mini-bus-icon.component.css'
})
export class MiniBusIconComponent {
  @Input() showMiniBus!: boolean;
}
