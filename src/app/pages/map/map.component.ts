import { AfterViewInit, Component, OnInit, QueryList, ViewChildren, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { YaClustererComponent, YaGeoObjectDirective, YaMapComponent, YaPlacemarkDirective } from 'angular8-yandex-maps';
import { QueryService } from '@services/query';
import { finalize, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { BadgeModule } from 'primeng/badge';
import { TOP_COLORS } from '@/core/constants/map';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList } from '@services/interfaces';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { AnnouncementsCardComponent } from '../../shared/components/cards/announcements-card/announcements-card.component';
import { DialogModule } from 'primeng/dialog';
import { Location } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';
import { LucideBusFront, LucideCarTaxiFront, LucideChevronsLeft, LucideTrainFront } from '@lucide/angular';
import { resolveAnnouncementCoordinates } from '@/core/geo';

type TransportToggleKey = 'showBus' | 'showSubway' | 'showMiniBus';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgClass, MultiSelectModule, RouterLink, DialogModule, FormsModule, SelectButtonModule, YaMapComponent, YaClustererComponent, YaPlacemarkDirective, YaGeoObjectDirective, NgIf, NgForOf, ButtonModule, StyleClassModule, BadgeModule, AnnouncementsCardComponent, DealTypeSwitcherComponent, LucideBusFront, LucideCarTaxiFront, LucideChevronsLeft, LucideTrainFront],
  templateUrl: './map.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  public loadingRouteIds = new Set<string>();
  public selectRoutes: any = [];
  public routeTransports: any = [];
  public announcements: any = [];
  public currentAnnouce: any = {};
  public zoom: any = 10;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private dealTypeSubscription?: Subscription;
  private deepLinkedAnnouncement: any | null = null;

  get transportLoading(): boolean {
    return this.loadingRouteIds.size > 0;
  }

  isTransportLoading(transport: any): boolean {
    return this.loadingRouteIds.has(this.routeKey(transport?.ri ?? transport));
  }

  isTransportSelected(transport: any): boolean {
    return this.routeTransports.some((ri: any) => Number(ri) === Number(transport?.ri));
  }

  constructor(public router: Router, private queryService: QueryService, private requestService: RequestService, public location: Location, private dealTypeService: DealTypeService) {}

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
    this.loadDeepLinkedAnnouncement();
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

  toggleBus(showType: TransportToggleKey) {
    this[showType] = !this[showType];
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
    this.refreshRouteTransports();
    const query = this.queryService.activeQueryList();
    if (Object.keys(query).length > 0) this.queryService.updateCustomQuery(query, this.__GET_ANNOUNCEMENTS);
    if (this.routeTransports?.length > 0) {
      this.routeTransports.forEach((elem: any) => this.handleBusRoute(elem));
    }
    this.selectedTransportsGenerateFirst();
  }

  checkTransports(transport: any) {
    if (!transport) return { ...this.queryService.activeQueryList() };
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
    return query;
  }

  deleteMapLine(transport: any) {
    let currentTransport = this.transports.find((elem: any) => Number(elem.ri) === Number(transport.ri));
    if (currentTransport) delete currentTransport.color;
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
            this.addSelectedTransport('bus', elem);
            break;
          case 'METRO':
            this.addSelectedTransport('subway', elem);
            break;
          case 'MARSHUTKA':
            this.addSelectedTransport('miniBus', elem);
            break;
          default:
            break;
        }
      }
    });
  }

  async selectedTransportsGenerateFirst() {
    this.selectedTransports = {
      bus: [],
      miniBus: [],
      subway: [],
    };
    this.transports.forEach((elem: any) => {
      if (this.routeTransports.map((item: any) => Number(item)).includes(Number(elem.ri))) {
        switch (elem.type) {
          case 'BUS':
            this.addSelectedTransport('bus', elem);
            break;
          case 'METRO':
            this.addSelectedTransport('subway', elem);
            break;
          case 'MARSHUTKA':
            this.addSelectedTransport('miniBus', elem);
            break;
          default:
            break;
        }
      }
    });
  }

  handleBusRoute(number: any) {
    if (this.selectRoutes.some((elem: any) => Number(elem.ri) === Number(number)) || this.isTransportLoading(number)) return;
    const formData = {
      id: number,
    };
    this.__GET_BUS_ROUTE(formData, number);
  }

  __GET_BUS_ROUTE = async (formData: any, number: any) => {
    const routeKey = this.routeKey(number);
    this.loadingRouteIds = new Set(this.loadingRouteIds).add(routeKey);
    this.requestService
      .requestData(environment.urls.POST_BUSROUTES, 'POST', formData)
      .pipe(
        finalize(() => {
          const loadingRouteIds = new Set(this.loadingRouteIds);
          loadingRouteIds.delete(routeKey);
          this.loadingRouteIds = loadingRouteIds;
        })
      )
      .subscribe(async (data: any) => {
        this.refreshRouteTransports();
        if (!data?.scheme?.forward || !data?.scheme?.backward) return;

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
        if (currentTransport) currentTransport.color = color;
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
    const { announcement: _announcement, ...activeFilters } = this.queryService.activeQueryList();
    const params = { ...activeFilters, deal_type: this.currentDealType };
    this.requestService.getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.queryService.generatorHttpParams(params)).subscribe((response: IAnnouncementList) => {
      this.refreshRouteTransports();
      const results = Array.isArray(response?.results) ? response.results : [];
      this.announcements = results
        .map((item: any) => this.normalizeAnnouncement(item))
        .filter(Boolean);
      if (this.deepLinkedAnnouncement && this.deepLinkedAnnouncement.deal_type === this.currentDealType) {
        this.announcements = [
          this.deepLinkedAnnouncement,
          ...this.announcements.filter((item: any) => item.id !== this.deepLinkedAnnouncement.id),
        ];
        this.focusDeepLinkedAnnouncement();
      } else if (this.announcements.length > 0) {
        this.mapCenter = [...this.announcements[0].geometry];
      }
    });
  };

  private loadDeepLinkedAnnouncement(): void {
    const rawId = this.queryService.activeQueryList()['announcement'];
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isInteger(id) || id <= 0) return;

    this.requestService.getData<any>(`${environment.urls.GET_ANNONCEMENTS}${id}/`).subscribe({
      next: (item) => {
        const normalized = this.normalizeAnnouncement(item);
        if (!normalized) return;
        this.deepLinkedAnnouncement = normalized;
        if (isDealType(item.deal_type)) {
          this.currentDealType = item.deal_type;
          this.dealTypeService.setDealType(item.deal_type);
          void this.router.navigate([], {
            queryParams: { deal_type: item.deal_type },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
        this.announcements = [
          normalized,
          ...this.announcements.filter((announcement: any) => announcement.id !== normalized.id),
        ];
        this.focusDeepLinkedAnnouncement();
        this.__GET_ANNOUNCEMENTS();
      },
    });
  }

  private normalizeAnnouncement(item: any): any | null {
    const coordinates = resolveAnnouncementCoordinates(item);
    if (!coordinates) return null;
    const [latitude, longitude] = coordinates;
    return { ...item, location_x: latitude, location_y: longitude, geometry: [latitude, longitude] };
  }

  private focusDeepLinkedAnnouncement(): void {
    if (!this.deepLinkedAnnouncement) return;
    this.mapCenter = [...this.deepLinkedAnnouncement.geometry];
    this.zoom = 15;
    this.currentAnnouce = this.deepLinkedAnnouncement;
    this.showInfo = true;
  }

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
      const routes = this.selectRoutes || [];
      this.transports = (response || []).map((item: any) => {
        const route = routes.find((elem: any) => Number(elem.ri) === Number(item.ri));
        return route ? { ...item, color: route.color } : item;
      });
      this.buses = this.transports
        .filter((item: any) => item.type == 'BUS')
        .sort((a: any, b: any) => {
          const nameA: number = parseInt(a.name);
          const nameB: number = parseInt(b.name);
          return nameA - nameB;
        });
      this.subways = this.transports.filter((item: any) => item.type == 'METRO');
      this.marshutka = this.transports.filter((item: any) => item.type == 'MARSHUTKA');
      this.selectedTransportsGenerateFirst();
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
  handleClusterClick(e: any) {}
  onChange(event: any) {
    if (typeof event.itemValue === 'string') {
      let transport = this.transports.find((elem: any) => elem.ri === event.itemValue);
      if (!transport) return;
      this.filterTransport(transport);
    } else {
      if (!event.itemValue) return;
      this.filterTransport(event.itemValue);
    }
  }

  async onClear() {
    let query: any = { ...this.queryService.activeQueryList() };
    if (query['transports']) query.transports = [];
    // this.queryService.updateCustomQuery(query, this.getData).then(() => {});
  }

  private refreshRouteTransports(): void {
    const value = this.queryService.activeQueryList()['transports'];
    this.routeTransports = Array.isArray(value) ? value : value ? [value] : [];
  }

  private addSelectedTransport(type: 'bus' | 'miniBus' | 'subway', transport: any): void {
    if (!this.selectedTransports[type].some((elem: any) => Number(elem.ri) === Number(transport.ri))) {
      this.selectedTransports[type].push(transport);
    }
  }

  private routeKey(value: any): string {
    return String(value ?? '');
  }
}
