import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideList, LucideSlidersHorizontal } from '@lucide/angular';
import { RegionOption } from '@/core/services/dictionary/dictionary.service';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';

@Component({
  selector: 'app-map-header',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink, DealTypeSwitcherComponent, LucideList, LucideSlidersHorizontal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-header.component.html',
  styleUrl: './map-header.component.css',
})
export class MapHeaderComponent {
  @Input() announcementCount = 0;
  @Input() listingsLoaded = false;
  @Input() listingsError = false;
  @Input() listQueryParams: Record<string, unknown> = {};
  @Input() regions: RegionOption[] = [];
  @Input() districts: RegionOption[] = [];
  @Input() selectedRegion: number | null = null;
  @Input() selectedDistrict: number | null = null;
  @Input() locationLoading = true;
  @Output() readonly regionChange = new EventEmitter<number>();
  @Output() readonly districtChange = new EventEmitter<number | null>();
  @Output() readonly retryListings = new EventEmitter<void>();
  @ViewChild('areaMenu') private areaMenu?: ElementRef<HTMLDetailsElement>;

  @HostListener('document:click', ['$event.target'])
  closeWhenOutside(target: EventTarget | null): void {
    const menu = this.areaMenu?.nativeElement;
    if (menu?.open && target instanceof Node && !menu.contains(target)) menu.open = false;
  }

  closeOnFocusOut(event: FocusEvent): void {
    if (event.relatedTarget) this.closeWhenOutside(event.relatedTarget);
  }
}
