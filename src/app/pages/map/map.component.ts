import { AfterViewInit, Component, OnInit, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { AnouncementMapCardComponent } from '@components/announcement/anouncement-map-card/anouncement-map-card.component';
import { QueryService } from '@services/query';
import { finalize, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { SubwayIconComponent } from '@/shared/icons/subway-icon/subway-icon.component';
import { BusIconComponent } from '@/shared/icons/bus-icon/bus-icon.component';
import { MiniBusIconComponent } from '@/shared/icons/mini-bus-icon/mini-bus-icon.component';
import { BadgeModule } from 'primeng/badge';
import { TOP_COLORS } from '@/core/constants/map';
import { CryptoService } from '@services/crypto';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList } from '@services/interfaces';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { AnnouncementsCardComponent } from '../../shared/components/cards/announcements-card/announcements-card.component';
import { HttpClient } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Location } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgClass, MultiSelectModule, ProgressSpinnerModule, RouterLink, OverlayPanelModule, DialogModule, FormsModule, SelectButtonModule, AngularYandexMapsModule, AnouncementMapCardComponent, NgIf, NgForOf, ButtonModule, StyleClassModule, SubwayIconComponent, BusIconComponent, MiniBusIconComponent, BadgeModule, BottomSheetComponent, AnnouncementsCardComponent, DealTypeSwitcherComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild(BottomSheetComponent) bottomSheetComponent!: BottomSheetComponent
  @ViewChildren(BottomSheetComponent)
  bottomSheetComponents!: QueryList<BottomSheetComponent>;
  public tab: 'bus' | 'mashrutka' | 'metro' = 'bus';
  stateOptions: any[] = [
    { label: 'Avtobus', value: 'bus' },
    { label: 'Mashrutka', value: 'mashrutka' },
    { label: 'Metro', value: 'metro' },
  ];
  bottomSheetFilter!: BottomSheetComponent;
  bottomSheetTransports!: BottomSheetComponent;
  bottomSheetInfo!: BottomSheetComponent;

  ngAfterViewInit() {
    const componentsArray = this.bottomSheetComponents.toArray();
    this.bottomSheetFilter = componentsArray[0];
    this.bottomSheetTransports = componentsArray[1];
    this.bottomSheetInfo = componentsArray[2];
  }

  public showBus: boolean = false;
  public selectedTransports: { bus: any; miniBus: any; subway: any } = {
    bus: [],
    miniBus: [],
    subway: [],
  };
  public showTransports: boolean = false;
  public showSubway: boolean = false;
  public showMiniBus: boolean = false;
  public showInfo: boolean = false;
  public showToolbar: boolean = false;
  public loading: boolean = false;
  public coords: number[] = [41.31340266251607, 69.28703784942628];
  public mapCenter: number[] = [41.31340266251607, 69.28703784942628];
  public marshutka: any = [];
  public subways: any = [];
  public buses: any = [];
  public transports: any = [];
  public transportLoading: boolean = false;
  public selectRoutes: any = [];
  public routeTransports: any = [];
  public announcements: any = [];
  public currentAnnouce: any = {};
  public zoom: any = 10;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private dealTypeSubscription?: Subscription;

  constructor(public router: Router, private queryService: QueryService, private cryptoService: CryptoService, private requestService: RequestService, private _httpRequest: HttpClient, public location: Location, private dealTypeService: DealTypeService) {}

  ngOnInit() {
    this.__GET_TRANSPORTS();
    if (typeof window !== 'undefined') {
      this.applyDealTypeFromQuery();
      this.activeTransports();
      // this.__POST_TRANSPORTS()
    }
    this.dealTypeSubscription = this.dealTypeService.dealType$.subscribe((type) => {
      this.currentDealType = type;
      this.syncDealTypeQuery(type);
    });
  }

  ngOnDestroy(): void {
    this.dealTypeSubscription?.unsubscribe();
  }

  filterSend = (e: any) => {
    this.queryService.updateCustomQuery(e, this.__GET_ANNOUNCEMENTS).then(() => {});
  };

  clearFilter = () => {
    this.queryService.clearFilterWithOutDefault(this.__GET_ANNOUNCEMENTS).then(() => {});
  };

  toggleBus(showType: string) {
    if (showType === 'showBus' || showType === 'showSubway' || showType === 'showMiniBus') this[showType] = !this[showType];
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
    if (this.showToolbar) this.showInfo = false;
  }

  closeAnnouncementInfo = () => {
    this.showInfo = false;
    this.closeBShInfo();
  };

  handleAnnounce(id: number) {
    this.showInfo = true;
    // this.openBShInfo();
    if (this.showInfo) this.showToolbar = false;
    this.currentAnnouce = this.announcements.find((elem: any) => elem.id == id);
    // this.currentAnnouce.id === id ? (this.showInfo = false) : (this.currentAnnouce = this.announcements.find((elem: any) => elem.id == id));
  }

  activeTransports() {
    if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
      this.routeTransports = [this.queryService.activeQueryList()['transports']];
    } else {
      this.routeTransports = this.queryService.activeQueryList()['transports'] || [];
    }
    if (Object.keys(this.queryService.activeQueryList()).length > 0) this.queryService.updateCustomQuery(this.queryService.activeQueryList(), this.__GET_ANNOUNCEMENTS);
    if (this.routeTransports?.length > 0) {
      Promise.all([this.routeTransports.map((elem: any) => this.handleBusRoute(elem))]);
    }
    this.selectedTransportsGenerateFirst();
  }

  checkTransports(transport: any) {
    let query: any = { ...this.queryService.activeQueryList() };
    if (typeof query.transports === 'string') {
      query.transports = [query.transports];
    }
    if (query.transports && query.transports.includes(transport.ri)) {
      query.transports = query.transports.filter((elem: any) => Number(elem) !== Number(transport.ri));
      this.selectRoutes = this.selectRoutes.filter((elem: any) => Number(elem.ri) !== Number(transport.ri));
      this.selectedTransportsGenerateDelete(transport);
      this.deleteMapLine(transport);
    } else {
      if (!query.transports) query.transports = [];
      query.transports.push(transport.ri);
      this.selectedTransportsGenerateUpdate(transport);
    }
    if (query.transports.length == 0 && typeof query.transports === 'string') {
      delete query.transports;
    }
    return query;
  }

  deleteMapLine(transport: any) {
    let currentTransport = this.transports.find((elem: any) => Number(elem.ri) === Number(transport.ri));
    delete currentTransport.color;
  }

  filterTransport(obj: any) {
    let cQuery = this.checkTransports(obj);
    if (cQuery?.transports.length === 0) {
      delete cQuery.transports;
    }
    if (Object.keys(cQuery).length > 0) {
      this.queryService.updateCustomQuery(cQuery, this.__GET_ANNOUNCEMENTS).then(() => {
        if (cQuery.transports?.length > 0) {
          let newQuery = cQuery.transports.filter((elem: any) => !this.selectRoutes.find((item: any) => Number(item.ri) === Number(elem)));
          Promise.all([newQuery.map((elem: any) => this.handleBusRoute(elem))]).then((r) => {});
        }
      });
    } else {
      this.queryService.clearFilterWithOutDefault(() => {
        if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
          this.routeTransports = [this.queryService.activeQueryList()['transports']];
        } else {
          this.routeTransports = this.queryService.activeQueryList()['transports'] || [];
        }

        this.announcements = [];
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
    const secretKey = this.cryptoService.getKey();
    const formData = {
      id: number,
      key: secretKey,
    };
    this.__GET_BUS_ROUTE(formData, number);
  }

  __GET_BUS_ROUTE = async (formData: any, number: any) => {
    this.transportLoading = true;
    this.requestService
      .requestData(environment.urls.POST_BUSROUTES, 'POST', formData)
      .pipe(
        finalize(() => {
          this.transportLoading = false;
        })
      )
      .subscribe(async (data: any) => {
        if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
          this.routeTransports = [this.queryService.activeQueryList()['transports']];
        } else {
          this.routeTransports = this.queryService.activeQueryList()['transports'] || [];
        }

        let busRoutes: any = {};
        busRoutes.x = data.scheme.forward.split(' ').map((elem: any) => {
          return {
            lat: elem.split(',')[0],
            lng: elem.split(',')[1],
          };
        });
        busRoutes.y = data.scheme.backward.split(' ').map((elem: any) => {
          return {
            lat: elem.split(',')[0],
            lng: elem.split(',')[1],
          };
        });
        let color: any = TOP_COLORS.filter((elem: any) => !this.transports.map((item: any) => item.color).includes(elem))[0];
        busRoutes.color = color;
        busRoutes.ri = number;
        let currentTransport = this.transports.find((elem: any) => elem.ri == number);
        currentTransport.color = color;
        this.transports = [...this.transports];
        this.selectRoutes.push(busRoutes);
        let selectedRies: any = this.routeTransports;
        this.selectRoutes = this.selectRoutes
          .filter((elem: any) => selectedRies.includes(elem.ri))
          .map((item: any) => {
            return {
              ...item,
              x: item.x.map((item2: any) => {
                if (item2.lat) {
                  return [item2.lat, item2.lng];
                } else {
                  return item2;
                }
              }),
            };
          });
      });
  };
  __GET_ANNOUNCEMENTS = () => {
    const params = { ...this.queryService.activeQueryList(), deal_type: this.currentDealType };
    this.requestService.getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.queryService.generatorHttpParams(params)).subscribe((response: IAnnouncementList) => {
      if (typeof this.queryService.activeQueryList()['transports'] === 'string') {
        this.routeTransports = [this.queryService.activeQueryList()['transports']];
      } else {
        this.routeTransports = this.queryService.activeQueryList()['transports'] || [];
      }
      this.announcements = response?.results
        .filter((elem: any) => Number(elem.location_x))
        .map((item: any) => {
          return {
            ...item,
            geometry: [item.location_x, item.location_y],
          };
        });
      if (this.announcements.length > 0) this.mapCenter = [this.announcements[0].location_x, this.announcements[0].location_y];
    });
  };

  private applyDealTypeFromQuery() {
    const urlDealType = this.readDealTypeFromQuery();
    if (urlDealType) {
      this.currentDealType = urlDealType;
      this.dealTypeService.setDealType(urlDealType);
    }
  }

  private readDealTypeFromQuery(): DealType | null {
    const value = this.queryService.activeQueryList()['deal_type'];
    const normalized = Array.isArray(value) ? value[0] : value;
    return isDealType(normalized) ? normalized : null;
  }

  private syncDealTypeQuery(type: DealType) {
    const currentQueryType = this.readDealTypeFromQuery() ?? DEFAULT_DEAL_TYPE;
    if (currentQueryType === type) {
      this.__GET_ANNOUNCEMENTS();
      return;
    }
    const payload = type === DEFAULT_DEAL_TYPE ? { deal_type: null } : { deal_type: type };
    this.queryService.updateCustomQuery(payload, this.__GET_ANNOUNCEMENTS);
  }

  __GET_TRANSPORTS() {
    this.requestService.getData<any>(environment.urls.GET_TRANSPORTS).subscribe((response: any) => {
      this.transports = response;
      this.buses = response
        .filter((item: any) => item.type == 'BUS')
        .sort((a: any, b: any) => {
          const nameA: number = parseInt(a.name);
          const nameB: number = parseInt(b.name);
          return nameA - nameB;
        });
      this.subways = response.filter((item: any) => item.type == 'METRO');
      this.marshutka = response.filter((item: any) => item.type == 'MARSHUTKA');
    });
  }

  // openBottomSheet() {
  //   this.bottomSheetComponent.open()
  //
  // }
  openBShFilter() {
    this.bottomSheetFilter.open();
  }

  closeBShFilter = () => {
    this.bottomSheetFilter.close();
  };

  openBShTransport() {
    this.toggleBus('showBus');
    this.bottomSheetTransports.open();
  }

  closeBShTransport() {
    this.bottomSheetTransports.close();
    this.showSubway = false;
    this.showMiniBus = false;
    this.showBus = false;
  }

  openBShInfo() {
    this.bottomSheetInfo.open();
  }
  closeBShInfo() {
    this.bottomSheetInfo.close();
  }
  handleClusterClick(e: any) {
    console.log(e);
  }

  // __POST_TRANSPORTS() {
  //   this._httpRequest.get('https://api.nexthome.uz/api/proxy/?urls=https://uz.easyway.info/en/cities/tashkent/routes').subscribe((res: any) => {
  //     console.log(res)
  //   })
  // }
  onChange(event: any) {
    if (typeof event.itemValue === 'string') {
      let transport = this.transports.find((elem: any) => elem.ri === event.itemValue);
      this.filterTransport(transport);
    } else {
      this.filterTransport(event.itemValue);
    }
  }

  async onClear() {
    let query: any = { ...this.queryService.activeQueryList() };
    if (query['transports']) query.transports = [];
    // this.queryService.updateCustomQuery(query, this.getData).then(() => {});
  }
}
