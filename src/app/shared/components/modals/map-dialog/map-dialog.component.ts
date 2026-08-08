import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { YaMapComponent, YaPlacemarkDirective } from 'angular8-yandex-maps';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-map-dialog',
  standalone: true,
  imports: [DialogModule, YaMapComponent, YaPlacemarkDirective, ButtonModule],
  templateUrl: './map-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './map-dialog.component.css',
})
export class MapDialogComponent {
  public visible: boolean = false;
  public coords: number[] = [41.31340266251607, 69.28703784942628];
  public mapCenter: number[] = [41.31340266251607, 69.28703784942628];
  @Input() formHandle!: Function;

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
  }

  handleMapClick(event: any) {
    this.coords = event.event.get('coords');
    this.formHandle({ coords: this.coords });
  }

  handleLocation = (location: any) => {
    if (location.lat) {
      this.coords = [location.lat, location.lon];
      this.mapCenter = [location.lat, location.lon];
      this.formHandle({ coords: this.coords });
    }
  };
}
