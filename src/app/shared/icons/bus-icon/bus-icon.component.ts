import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bus-icon',
  standalone: true,
  imports: [NgClass],
  templateUrl: './bus-icon.component.html',
  styleUrl: './bus-icon.component.css',
})
export class BusIconComponent {
  @Input() showBus!: boolean;
}
