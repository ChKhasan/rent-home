import { Component, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgencySidebarComponent } from './components/sidebar/sidebar.component';

import { AgencyAccessService } from '@services/agency-access';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-agency',
  standalone: true,
  imports: [RouterOutlet, AgencySidebarComponent],
  templateUrl: './agency.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './agency.component.css',
})
export class AgencyComponent {
  hasMembership = true;

  constructor(private agencyAccessService: AgencyAccessService, private destroyRef: DestroyRef) {
    this.agencyAccessService
      .hasMembership()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((flag) => (this.hasMembership = flag));
  }
}
