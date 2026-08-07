import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  LucideBedDouble,
  LucideBuilding2,
  LucideCheck,
  LucideMaximize2,
  LucideRefrigerator,
  LucideSnowflake,
  LucideSparkles,
  LucideUsers,
  LucideWashingMachine,
} from '@lucide/angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    LucideBedDouble,
    LucideBuilding2,
    LucideCheck,
    LucideMaximize2,
    LucideRefrigerator,
    LucideSnowflake,
    LucideSparkles,
    LucideUsers,
    LucideWashingMachine,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  @Input() announcement: any = { lessee_types: [] };

  get hasAmenities(): boolean {
    return Boolean(
      this.announcement?.conditioner
      || this.announcement?.fridge
      || this.announcement?.washing_machine,
    );
  }

  get hasTenantConditions(): boolean {
    return Boolean(this.announcement?.lessee_types?.length || this.announcement?.need_people_count);
  }
}
