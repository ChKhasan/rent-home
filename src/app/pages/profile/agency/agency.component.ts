import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgencySidebarComponent } from './components/sidebar/sidebar.component';
import { NgIf } from '@angular/common';
import { AgencyAccessService } from '@services/agency-access';

@Component({
  selector: 'app-agency',
  standalone: true,
  imports: [NgIf, RouterOutlet, AgencySidebarComponent],
  templateUrl: './agency.component.html',
  styleUrl: './agency.component.css',
})
export class AgencyComponent {
  hasMembership = true;

  constructor(private agencyAccessService: AgencyAccessService) {
    this.agencyAccessService.hasMembership().subscribe((flag) => (this.hasMembership = flag));
  }
}
