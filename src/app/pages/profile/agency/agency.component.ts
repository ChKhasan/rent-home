import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgencySidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-agency',
  standalone: true,
  imports: [RouterOutlet, AgencySidebarComponent],
  templateUrl: './agency.component.html',
  styleUrl: './agency.component.css',
})
export class AgencyComponent {}
