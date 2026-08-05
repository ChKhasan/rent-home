import { Component } from '@angular/core';
import { LucideSearchX } from '@lucide/angular';

@Component({
  selector: 'app-empty-found',
  standalone: true,
  imports: [LucideSearchX],
  templateUrl: './empty-found.component.html',
  styleUrl: './empty-found.component.css',
})
export class EmptyFoundComponent {
  constructor() {
  }
}
