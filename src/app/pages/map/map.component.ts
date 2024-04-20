import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FilterComponent} from "../../shared/components/announcement/filter/filter.component";
import {AngularYandexMapsModule} from "angular8-yandex-maps";
import {
  AnouncementMapCardComponent
} from "../../shared/components/announcement/anouncement-map-card/anouncement-map-card.component";
import {TransportsService} from "../../core/services/transports/transports.service";
import {QueryService} from "../../core/services/query/query.service";
import {AnnouncementsService} from "../../core/services/announcements/announcements.service";
import {finalize} from "rxjs";
import {ButtonModule} from "primeng/button";
import {StyleClassModule} from "primeng/styleclass";

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
    StyleClassModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  public showBus: boolean = false;
  public showInfo: boolean = false;
  public showToolbar: boolean = false;
  public loading: boolean = false;
  public coords: number[] = [41.31340266251607, 69.28703784942628];
  public mapCenter: number[] = [41.31340266251607, 69.28703784942628];
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
  placemarks: any = [
    {
      geometry: [55.684758, 37.738521],
      properties: {
        balloonContent:
          'the color of <strong>the water on Bondi Beach</strong>',
      },
      options: {
        preset: 'islands#icon',
        iconColor: '#0095b6',
      },
    },
    {
      geometry: [55.833436, 37.715175],
      properties: {
        balloonContent: '<strong>greyish-brownish-maroon</strong> color',
      },
      options: {
        preset: 'islands#dotIcon',
        iconColor: '#735184',
      },
    },
    {
      geometry: [55.687086, 37.529789],
      properties: {
        balloonContent: 'the color of <strong>enamored toads</strong>',
      },
      options: {
        preset: 'islands#circleIcon',
        iconColor: '#3caa3c',
      },
    },
    {
      geometry: [55.782392, 37.614924],
      properties: {
        balloonContent: 'the color of <strong>Surprise Dauphin</strong>',
      },
      options: {
        preset: 'islands#circleDotIcon',
        iconColor: 'yellow',
      },
    },
    {
      geometry: [55.642063, 37.656123],
      properties: {
        balloonContent: '<strong>red</strong> color',
      },
      options: {
        preset: 'islands#redSportIcon',
      },
    },
    {
      geometry: [55.826479, 37.487208],
      properties: {
        balloonContent: '<strong>Facebook</strong> color',
      },
      options: {
        preset: 'islands#governmentCircleIcon',
        iconColor: '#3b5998',
      },
    },
    {
      geometry: [55.694843, 37.435023],
      properties: {
        balloonContent: "<strong>crocodile's nose</strong> color",
        iconCaption: 'Really, really long but super interesting text',
      },
      options: {
        preset: 'islands#greenDotIconWithCaption',
      },
    },
    {
      geometry: [55.694843, 37.435023],
      properties: {
        balloonContent: '<strong>blue</strong> color',
        iconCaption: 'Really, really long but super interesting text',
      },
      options: {
        preset: 'islands#blueCircleDotIconWithCaption',
        iconCaptionMaxWidth: '50',
      },
    },
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

  toggleBus() {
    this.showBus = !this.showBus
  }

  toggleToolbar() {
    this.showToolbar = !this.showToolbar;
    if(this.showToolbar) {
      this.showInfo = false
    }
  }
  handleAnnounce(id: number) {
    this.showInfo = !this.showInfo;
    if(this.showInfo) {
      this.showToolbar = false
    }
    this.currentAnnouce = this.announcements.find((elem: any) => elem.id == id);
  }
  handleLocation = (location: any) => {
    this.coords = [location.lat, location.lon];
    this.mapCenter = [location.lat, location.lon];
    this.handleMapClick({
      event: {
        get: () => {
          return [location.lat, location.lon]
        }
      }
    });
  };

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
  }

  checkTransports(transport: any) {
    let query: any = {...this.queryService.activeQueryList()};
    if (typeof query.transports === 'string') {
      query.transports = [query.transports]
    }
    if (query.transports && query.transports.includes(transport.ri)) {
      query.transports = query.transports.filter((elem: any) => Number(elem) !== Number(transport.ri));
      this.selectRoutes = this.selectRoutes.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
      this.deleteMapLine(transport)
    } else {
      if (!query.transports) query.transports = []
      query.transports.push(transport.ri)
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
    if(cQuery?.transports.length === 0) {
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
        this.announcements = response?.results.filter((elem: any) => Number(elem.location_x));
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
      this.transports = response.filter((item: any) => item.type == 'BUS').sort((a: any, b: any) => {
        const nameA: number = parseInt(a.name);
        const nameB: number = parseInt(b.name);
        return nameA - nameB;
      });
    })
  }
  public onLoad(event: any) {
    console.log(event)
    /**
     * Не лучшее решение доставать контрол по индексу
     * Но не нашел метода для получения как-то иначе, например, по типу
     *
     * Лучше сделать через .each()
     * https://tech.yandex.ru/maps/jsapi/doc/2.1/ref/reference/control.Manager-docpage/
     */

    const searchControl = event.instance.controls.get(1);

    /**
     * Список ивентов можно посмотреть тут:
     * https://tech.yandex.ru/maps/jsapi/doc/2.1-dev/ref/reference/control.SearchControl-docpage/
     */
    searchControl.events.add(
      ['submit'],
      (e: any) => console.log(e.get('target').getRequestString())
    );
  }
}
