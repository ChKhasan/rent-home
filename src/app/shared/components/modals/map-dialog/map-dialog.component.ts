import { Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DEFAULT_MAP_CENTER } from '@/core/constants/map';

@Component({
  selector: 'app-map-dialog',
  standalone: true,
  imports: [DialogModule, AngularYandexMapsModule, NgIf, ButtonModule],
  templateUrl: './map-dialog.component.html',
  styleUrl: './map-dialog.component.css',
})
export class MapDialogComponent {
  public visible: boolean = false;
  public coords: number[] = [...DEFAULT_MAP_CENTER];
  public mapCenter: number[] = [...DEFAULT_MAP_CENTER];
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
