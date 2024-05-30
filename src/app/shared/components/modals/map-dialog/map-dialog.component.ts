import {Component, Input, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {AngularYandexMapsModule} from "angular8-yandex-maps";
import {NgForOf, NgIf} from "@angular/common";
import {TransportsService} from "../../../../core/services/transports/transports.service";
import {ButtonModule} from "primeng/button";
import {finalize} from "rxjs";
import {CryptoService} from "../../../../core/services/crypto/crypto.service";

@Component({
  selector: 'app-map-dialog',
  standalone: true,
  imports: [
    DialogModule,
    AngularYandexMapsModule,
    NgIf,
    NgForOf,
    ButtonModule,
  ],
  templateUrl: './map-dialog.component.html',
  styleUrl: './map-dialog.component.css'
})
export class MapDialogComponent implements OnInit {

  public visible: boolean = false;
  public loading: boolean = false;
  public coords: number[] = [41.31340266251607, 69.28703784942628];
  public mapCenter: number[] = [41.31340266251607, 69.28703784942628];
  public allTransports: any[] = []
  public routes: number[] = []
  public metroWays: any[] = []
  public busRoutes: any[] = []
  public activeBus = false
  public transportLoading: boolean = false;
  public busRoute: any = {}
  @Input() formHandle!: Function

  constructor(
    private transportService: TransportsService,
    private cryptoService: CryptoService) {
  }

  showDialog() {
    this.visible = true
  }

  hideDialog() {
    this.visible = false
  }

  ngOnInit() {
    this.transportService.get().subscribe((response) => {
      this.allTransports = Object.values(response);
    })
  }

  handleMapClick(event: any) {
    this.coords = event.event.get('coords');
    console.log(this.coords)
    this.__GET_LOCATICON_TRANSPORTS(this.transportParams(this.coords));
  }

  transportParams(coords: number[]) {
    const secretKey = this.cryptoService.getKey()
    return {
      location_x: coords[0],
      location_y: coords[1],
      nearby: 500,
      key: secretKey,
      city: 'tashkent'
    };
  }

  __GET_LOCATICON_TRANSPORTS(formData: any) {
    this.transportService.postByLocation(formData).subscribe((response) => {
      this.routes = response.routes;
      let allBusRoutes: any[] = [];
      let metroRoutes: any[] = [];
      let mashRoutes: any[] = [];
      response.routes.forEach((elem: any) => {
        let currentBus = this.allTransports.find((item: any) => Number(item.ri) === elem && item.type === "BUS");

        let currentMash = this.allTransports.find(
          (item: any) => item.ri == elem && item.type == "MARSHUTKA"
        );
        let currentMetro = this.allTransports.find(
          (item: any) => item.ri == elem && item.type == "METRO"
        );
        if (currentBus) allBusRoutes.push(currentBus);
        if (currentMetro) metroRoutes.push(currentMetro);
        if (currentMash) mashRoutes.push(currentMash);
      });
      const metroWaysData = metroRoutes.map((item) => {
        return {
          name: item.name,
          type: "METRO",
        };
      });
      const busRoutesData = allBusRoutes.map((item) => {
        return {
          name: item.name,
          ri: item.ri,
          type: "BUS",
        };
      });
      this.metroWays = metroWaysData;
      this.busRoutes = busRoutesData;
      const transports = [...metroWaysData, ...busRoutesData];
      this.formHandle({transports: transports, coords: this.coords})
    })
  }

  handleLocation = (location: any) => {
    if (location.lat) {
      this.coords = [location.lat, location.lon];
      this.mapCenter = [location.lat, location.lon];
      this.handleMapClick({
        event: {
          get: () => {
            return [location.lat, location.lon]
          }
        }
      });
    }

  };

  handleBusRoute(number: any) {
    const secretKey = this.cryptoService.getKey()
    const formData = {
        id: number,
        key: secretKey,
    };
    this.activeBus = number
    this.__GET_BUS_ROUTE(formData, number);
  }

  __GET_BUS_ROUTE = async (formData: any, number: any) => {
    this.transportLoading = true
    this.busRoute = {}
    this.transportService.postBusRoutes(formData).pipe(finalize(() => {
      this.transportLoading = false
    })).subscribe(async (data) => {
      this.busRoute.x = data.scheme.forward.split(" ").map((elem: any) => {
        return [Number(elem.split(",")[0]), Number(elem.split(",")[1])]
      });
      this.busRoute.y = data.scheme.backward.split(" ").map((elem: any) => {
        return [Number(elem.split(",")[0]), Number(elem.split(",")[1])]
      });
    })

  };
}
