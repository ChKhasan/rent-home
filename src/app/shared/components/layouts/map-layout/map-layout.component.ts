import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-map-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './map-layout.component.html',
  styleUrl: './map-layout.component.css',
})
export class MapLayoutComponent {}
