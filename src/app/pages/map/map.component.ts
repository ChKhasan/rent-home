import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Router} from "@angular/router";
import {FilterComponent} from "../../shared/components/announcement/filter/filter.component";
import {AngularYandexMapsModule, YaReadyEvent} from "angular8-yandex-maps";
import {
  AnouncementMapCardComponent
} from "../../shared/components/announcement/anouncement-map-card/anouncement-map-card.component";
import {TransportsService} from "../../core/services/transports/transports.service";
import {QueryService} from "../../core/services/query/query.service";
import {AnnouncementsService} from "../../core/services/announcements/announcements.service";
import {finalize} from "rxjs";
import {ButtonModule} from "primeng/button";
import {StyleClassModule} from "primeng/styleclass";
import {SubwayIconComponent} from "../../shared/icons/subway-icon/subway-icon.component";
import {BusIconComponent} from "../../shared/icons/bus-icon/bus-icon.component";
import {MiniBusIconComponent} from "../../shared/icons/mini-bus-icon/mini-bus-icon.component";
import {BadgeModule} from "primeng/badge";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    NgClass,
    FilterComponent,
    AngularYandexMapsModule,
    AnouncementMapCardComponent,
    NgIf,
    NgForOf,
    ButtonModule,
    StyleClassModule,
    SubwayIconComponent,
    BusIconComponent,
    MiniBusIconComponent,
    BadgeModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  public showBus: boolean = false;
  public selectedTransports: { bus: any, miniBus: any, subway: any } = {
    bus: [],
    miniBus: [],
    subway: []
  }
  public showSubway: boolean = false;
  public showMiniBus: boolean = false;
  public showInfo: boolean = false;
  public showToolbar: boolean = false;
  public loading: boolean = false;
  public coords: number[] = [41.31340266251607, 69.28703784942628];
  public mapCenter: number[] = [41.31340266251607, 69.28703784942628];
  public marshutka: any = [];
  public subways: any = [];
  public buses: any = []
  public transports: any = [];
  public transportLoading: boolean = false
  public selectRoutes: any = []
  public routeTransports: any = []
  public announcements: any = []
  public currentAnnouce: any = {}
  public zoom: any = 10
  public topColors = [
    "rgb(255, 0, 0)",
    "rgb(0, 128, 0)",
    "rgb(0, 0, 255)",
    "rgb(255, 255, 0)",
    "rgb(128, 0, 128)",
    "rgb(255, 165, 0)",
    "rgb(255, 192, 203)",
    "rgb(64, 224, 208)",
    "rgb(165, 42, 42)",
    "rgb(0, 0, 0)",
    "rgb(128, 128, 128)",
    "rgb(245, 245, 220)",
    "rgb(128, 0, 0)",
    "rgb(0, 0, 128)",
    "rgb(0, 128, 128)",
    "rgb(1,190,1)",
    "rgb(75, 0, 130)",
    "rgb(0, 255, 255)",
    "rgb(255, 0, 255)"
  ];

  constructor(
    public router: Router,
    private transportsService: TransportsService,
    private queryService: QueryService,
    private announcementService: AnnouncementsService,
  ) {
  }

  ngOnInit() {
    this.__GET_TRANSPORTS();
    if (typeof window !== "undefined") {
      this.activeTransports()
    }
  }

  filterSend = (e: any) => {
    this.queryService.updateCustomQuery(e, this.__GET_ANNOUNCEMENTS).then(() => {
    })
  }

  clearFilter = () => {
    this.queryService.clearFilterWithOutDefault(this.__GET_ANNOUNCEMENTS).then(() => {
    })
  }

  toggleBus(showType: string) {
    if (showType === 'showBus' || showType === 'showSubway' || showType === 'showMiniBus')
      this[showType] = !this[showType]
    if (showType === 'showBus') {
      this.showSubway = false;
      this.showMiniBus = false;
    }
    if (showType === 'showMiniBus') {
      this.showSubway = false;
      this.showBus = false;
    }
    if (showType === 'showSubway') {
      this.showBus = false;
      this.showMiniBus = false;
    }

  }

  toggleToolbar() {
    this.showToolbar = !this.showToolbar;
    if (this.showToolbar) {
      this.showInfo = false
    }
  }

  handleAnnounce(id: number) {
    this.showInfo = !this.showInfo;
    if (this.showInfo) {
      this.showToolbar = false
    }
    this.currentAnnouce = this.announcements.find((elem: any) => elem.id == id);
  }


  handleMapClick(event: any) {
    this.coords = event.event.get('coords');
  }

  activeTransports() {
    if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
      this.routeTransports = [this.queryService.activeQueryList()['transports']] || []
    } else {
      this.routeTransports = this.queryService.activeQueryList()['transports'] || []
    }
    if (Object.keys(this.queryService.activeQueryList()).length > 0)
      this.queryService.updateCustomQuery(this.queryService.activeQueryList(), this.__GET_ANNOUNCEMENTS)
    if (this.routeTransports?.length > 0) {
      Promise.all([this.routeTransports.map((elem: any) => this.handleBusRoute(elem))]);
    }
    this.selectedTransportsGenerateFirst()
  }

  checkTransports(transport: any) {
    let query: any = {...this.queryService.activeQueryList()};
    if (typeof query.transports === 'string') {
      query.transports = [query.transports]
    }
    if (query.transports && query.transports.includes(transport.ri)) {
      query.transports = query.transports.filter((elem: any) => Number(elem) !== Number(transport.ri));
      this.selectRoutes = this.selectRoutes.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
      this.selectedTransportsGenerateDelete(transport)
      this.deleteMapLine(transport)
    } else {
      if (!query.transports) query.transports = []
      query.transports.push(transport.ri)
      this.selectedTransportsGenerateUpdate(transport)
    }
    if (query.transports.length == 0 && typeof query.transports === 'string') {
      delete query.transports
    }
    return query
  }

  deleteMapLine(transport: any) {
    let currentTransport = this.transports.find((elem: any) => Number(elem.ri) === Number(transport.ri));
    delete currentTransport.color;
  }

  filterTransport(obj: any) {

    let cQuery = this.checkTransports(obj);
    if (cQuery?.transports.length === 0) {
      delete cQuery.transports
    }
    if (Object.keys(cQuery).length > 0) {
      this.queryService.updateCustomQuery(cQuery, this.__GET_ANNOUNCEMENTS).then(() => {
        if (cQuery.transports?.length > 0) {
          let newQuery = cQuery.transports.filter((elem: any) => !this.selectRoutes.find((item: any) => Number(item.ri) === Number(elem)));
          Promise.all([newQuery.map((elem: any) => this.handleBusRoute(elem))]).then(r => {
          });
        }
      })
    } else {
      this.queryService.clearFilterWithOutDefault(() => {
        if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
          this.routeTransports = [this.queryService.activeQueryList()['transports']] || []
        } else {
          this.routeTransports = this.queryService.activeQueryList()['transports'] || []
        }

        this.announcements = []
      });
    }
  }
  selectedTransportsGenerateDelete(transport: any) {
    this.selectedTransports.bus = this.selectedTransports.bus.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
    this.selectedTransports.subway = this.selectedTransports.subway.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
    this.selectedTransports.miniBus = this.selectedTransports.miniBus.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
  }

  selectedTransportsGenerateUpdate(transport: any) {
    this.transports.forEach((elem: any) => {
      if (transport.ri === elem.ri) {
        switch (elem.type) {
          case 'BUS':
            this.selectedTransports.bus.push(elem);
            break;
          case 'METRO':
            this.selectedTransports.subway.push(elem);
            break;
          case 'MARSHUTKA':
            this.selectedTransports.miniBus.push(elem);
            break;
          default:
            break;
        }
      }
    });
  }

  async selectedTransportsGenerateFirst() {
    this.transports.forEach((elem: any) => {
      if (this.routeTransports.includes(elem.ri)) {
        switch (elem.type) {
          case 'BUS':
            this.selectedTransports.bus.push(elem);
            break;
          case 'METRO':
            this.selectedTransports.subway.push(elem);
            break;
          case 'MARSHUTKA':
            this.selectedTransports.miniBus.push(elem);
            break;
          default:
            break;
        }
      }
    });
  }

  handleBusRoute(number: any) {
    const formData = {
      params: {
        url: `https://uz.easyway.info/ajax/en/tashkent/routeInfo/${number}`,
      },
    };
    this.__GET_BUS_ROUTE(formData, number);
  }

  __GET_BUS_ROUTE = async (formData: any, number: any) => {
    this.transportLoading = true
    this.transportsService.getAll(formData).pipe(finalize(() => {
      this.transportLoading = false
    })).subscribe(async (data) => {
      if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
        this.routeTransports = [this.queryService.activeQueryList()['transports']] || []
      } else {
        this.routeTransports = this.queryService.activeQueryList()['transports'] || []
      }

      let busRoutes: any = {};
      busRoutes.x = data.scheme.forward.split(" ").map((elem: any) => {
        return {
          lat: elem.split(",")[0],
          lng: elem.split(",")[1],
        };
      });
      busRoutes.y = data.scheme.backward.split(" ").map((elem: any) => {
        return {
          lat: elem.split(",")[0],
          lng: elem.split(",")[1],
        };
      });
      let color: any = this.topColors.filter(
        (elem: any) => !this.transports.map((item: any) => item.color).includes(elem)
      )[0];
      busRoutes.color = color;
      busRoutes.ri = number;
      let currentTransport = this.transports.find((elem: any) => elem.ri == number);
      currentTransport.color = color;
      this.transports = [...this.transports];
      this.selectRoutes.push(busRoutes);
      let selectedRies: any = this.routeTransports
      this.selectRoutes = this.selectRoutes.filter((elem: any) =>
        selectedRies.includes(elem.ri)
      ).map((item: any) => {
        return {
          ...item,
          x: item.x.map((item2: any) => {
            if (item2.lat) {
              return [item2.lat, item2.lng]
            } else {
              return item2
            }
          })
        }
      });
    })

  };
  __GET_ANNOUNCEMENTS = () => {
    if (Object.keys(this.queryService.generatorHttpParams(this.queryService.activeQueryList())).length > 0) {
      this.announcementService.get(this.queryService.generatorHttpParams(this.queryService.activeQueryList())).subscribe((response) => {
        if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
          this.routeTransports = [this.queryService.activeQueryList()['transports']] || []
        } else {
          this.routeTransports = this.queryService.activeQueryList()['transports'] || []
        }
        this.announcements = response?.results.filter((elem: any) => Number(elem.location_x)).map((item: any) => {
          return {
            ...item,
            geometry: [item.location_x, item.location_y]
          }
        });
        if (this.announcements.length > 0)
          this.mapCenter = [
            this.announcements[0].location_x,
            this.announcements[0].location_y,
          ];
      })
    }

  }

  __GET_TRANSPORTS() {
    this.transportsService.get().subscribe((response) => {
      this.transports = response;
      this.buses = response.filter((item: any) => item.type == 'BUS').sort((a: any, b: any) => {
        const nameA: number = parseInt(a.name);
        const nameB: number = parseInt(b.name);
        return nameA - nameB;
      });
      this.subways = response.filter((item: any) => item.type == 'METRO');
      this.marshutka = response.filter((item: any) => item.type == 'MARSHUTKA');
    })
  }

}
