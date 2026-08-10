import { AfterViewInit, Component, OnInit, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
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
import { LucideBusFront, LucideCarTaxiFront, LucideCrosshair, LucideMapPin, LucideSearch, LucideTrainFront, LucideX } from '@lucide/angular';
import { resolveAnnouncementCoordinates } from '@/core/geo';
import {
  CommuteDestination,
  extractCommuteDestination,
  GeocodeSearchResponse,
  MapCoordinate,
  NearbyRoutesResponse,
  normalizeNearbyRouteIds,
} from './commute-search.utils';

type TransportToggleKey = 'showBus' | 'showSubway' | 'showMiniBus';

interface CommuteRoute {
  ri: string;
  name: string;
  type: string;
  color: string;
  distanceMeters: number | null;
  homeDistanceMeters?: number | null;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgClass, MultiSelectModule, RouterLink, DialogModule, FormsModule, SelectButtonModule, AngularYandexMapsModule, NgIf, NgForOf, ButtonModule, StyleClassModule, BadgeModule, AnnouncementsCardComponent, DealTypeSwitcherComponent, LucideBusFront, LucideCarTaxiFront, LucideCrosshair, LucideMapPin, LucideSearch, LucideTrainFront, LucideX],
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
  public loadingRouteIds = new Set<string>();
  public selectRoutes: any = [];
  public routeTransports: any = [];
  public announcements: any = [];
  public currentAnnouce: any = {};
  public zoom: any = 10;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  public destinationQuery = '';
  public commuteDestination: CommuteDestination | null = null;
  public commuteRoutes: CommuteRoute[] = [];
  public commuteLoading = false;
  public commuteError = '';
  public homeConnectionLoading = false;
  public homeConnectionError = '';
  public selectingDestination = false;
  public announcementCount = 0;
  public activeMapRouteId: string | null = null;
  public hoveredMapRouteId: string | null = null;
  public readonly commuteRadiusMeters = 200;
  public readonly homeRadiusMeters = 500;
  public readonly mapState: ymaps.IMapState = {
    controls: ['zoomControl', 'trafficControl', 'typeSelector', 'fullscreenControl'],
  };
  private dealTypeSubscription?: Subscription;
  private geocodeSubscription?: Subscription;
  private nearbyRoutesSubscription?: Subscription;
  private homeRoutesSubscription?: Subscription;
  private destinationRoutes: CommuteRoute[] = [];
  private routeDisplayOverride: string[] | null = null;
  private yandexMap?: ymaps.Map;
  private deepLinkedAnnouncement: any | null = null;

  get transportLoading(): boolean {
    return this.loadingRouteIds.size > 0;
  }

  get homeConnectionActive(): boolean {
    return this.routeDisplayOverride !== null && Boolean(this.commuteDestination);
  }

  isTransportLoading(transport: any): boolean {
    return this.loadingRouteIds.has(this.routeKey(transport?.ri ?? transport));
  }

  isTransportSelected(transport: any): boolean {
    return this.routeTransports.some((ri: any) => Number(ri) === Number(transport?.ri));
  }

  constructor(
    public router: Router,
    private queryService: QueryService,
    private requestService: RequestService,
    public location: Location,
    private dealTypeService: DealTypeService,
  ) {}

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
    this.geocodeSubscription?.unsubscribe();
    this.nearbyRoutesSubscription?.unsubscribe();
    this.homeRoutesSubscription?.unsubscribe();
  }

  searchCommuteDestination(): void {
    const query = this.destinationQuery.trim();
    if (query.length < 3 || this.commuteLoading) {
      if (query.length < 3) this.commuteError = 'Manzil yoki joy nomini kiriting.';
      return;
    }

    this.commuteLoading = true;
    this.commuteError = '';
    this.selectingDestination = false;
    this.geocodeSubscription?.unsubscribe();
    this.geocodeSubscription = this.requestService.getData<GeocodeSearchResponse>(
      environment.urls.GET_GEOCODE,
      { q: query },
    ).subscribe({
      next: (result) => {
        const destination = extractCommuteDestination(result, query);
        if (!destination) {
          this.commuteLoading = false;
          this.commuteError = 'Bu manzil topilmadi. Aniqroq nom yoki manzil kiriting.';
          return;
        }
        this.destinationQuery = destination.label;
        this.loadCommuteRoutes(destination);
      },
      error: (error) => {
        this.commuteLoading = false;
        this.commuteError = error?.status === 429
          ? 'Qidiruv juda tez yuborildi. Bir soniyadan keyin qayta urinib ko‘ring.'
          : 'Manzilni hozir qidirib bo‘lmadi. Qayta urinib ko‘ring.';
      },
    });
  }

  clearCommuteSearch(): void {
    this.geocodeSubscription?.unsubscribe();
    this.nearbyRoutesSubscription?.unsubscribe();
    this.homeRoutesSubscription?.unsubscribe();
    this.destinationQuery = '';
    this.commuteDestination = null;
    this.commuteRoutes = [];
    this.destinationRoutes = [];
    this.commuteError = '';
    this.homeConnectionError = '';
    this.commuteLoading = false;
    this.homeConnectionLoading = false;
    this.selectingDestination = false;
    this.routeDisplayOverride = null;
    this.clearSelectedRoutes();
    void this.queryService.updateCustomQuery({ transports: null }, this.__GET_ANNOUNCEMENTS);
  }

  toggleDestinationSelection(): void {
    if (this.commuteLoading) return;
    this.selectingDestination = !this.selectingDestination;
    this.commuteError = '';
  }

  handleDestinationMapClick(event: any): void {
    if (!this.selectingDestination || this.commuteLoading) return;
    const rawCoordinates = event?.event?.get?.('coords');
    const latitude = Number(rawCoordinates?.[0]);
    const longitude = Number(rawCoordinates?.[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const destination: CommuteDestination = {
      label: 'Xaritada tanlangan nuqta',
      coordinates: [latitude, longitude],
    };
    this.destinationQuery = destination.label;
    this.selectingDestination = false;
    this.commuteLoading = true;
    this.loadCommuteRoutes(destination);
  }

  handleMapBoundsChange(event: { target?: any; event?: any }): void {
    const nextZoom = Number(event.event?.get?.('newZoom') ?? event.target?.getZoom?.());
    if (Number.isFinite(nextZoom)) this.zoom = nextZoom;
  }

  handleMapReady(event: any): void {
    this.yandexMap = event?.target;
  }

  activateMapRoute(routeId: any): void {
    this.activeMapRouteId = this.routeKey(routeId);
  }

  showMapRoute(routeId: any, event: any): void {
    this.activateMapRoute(routeId);
    event?.event?.stopPropagation?.();
    const coordinates = event?.event?.get?.('coords');
    void event?.target?.balloon?.open?.(coordinates);
  }

  deactivateMapRoute(routeId: any): void {
    if (this.activeMapRouteId === this.routeKey(routeId)) this.activeMapRouteId = null;
  }

  hoverMapRoute(routeId: any): void {
    this.hoveredMapRouteId = this.routeKey(routeId);
  }

  showMapRouteHint(routeId: any, event: any): void {
    this.hoverMapRoute(routeId);
    const coordinates = event?.event?.get?.('coords');
    void event?.target?.hint?.open?.(coordinates);
  }

  unhoverMapRoute(routeId: any): void {
    if (this.hoveredMapRouteId === this.routeKey(routeId)) this.hoveredMapRouteId = null;
  }

  hideMapRouteHint(routeId: any, event: any): void {
    void event?.target?.hint?.close?.();
    this.unhoverMapRoute(routeId);
  }

  routeStrokeWidth(routeId: any): number {
    const zoom = Number(this.zoom);
    let width = 5;
    if (zoom <= 9) width = 1.5;
    else if (zoom <= 10) width = 2;
    else if (zoom <= 11) width = 2.5;
    else if (zoom <= 12) width = 3;
    else if (zoom <= 13) width = 3.5;
    else if (zoom <= 14) width = 4.25;
    return this.isMapRouteFocused(routeId) ? width + 2 : width;
  }

  routeStrokeOpacity(routeId: any): number {
    if (this.isMapRouteFocused(routeId)) return 1;
    if (this.activeMapRouteId || this.hoveredMapRouteId) return 0.32;
    return Number(this.zoom) <= 10 ? 0.72 : 0.88;
  }

  routeHitStrokeWidth(): number {
    return 12;
  }

  routeZIndex(routeId: any): number {
    return this.isMapRouteFocused(routeId) ? 1000 : 100;
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
    if (this.showToolbar && this.showInfo) this.closeAnnouncementInfo();
  }

  closeAnnouncementInfo = () => {
    this.showInfo = false;
    this.restoreDestinationRoutes();
    this.closeBShInfo();
  };

  handleAnnouncementDialogHide(): void {
    this.restoreDestinationRoutes();
  }

  handleAnnounce(id: number) {
    const announcement = this.announcements.find((elem: any) => elem.id == id);
    if (!announcement) return;

    this.currentAnnouce = announcement;
    this.showInfo = true;
    this.showToolbar = false;
    if (this.commuteDestination && this.destinationRoutes.length > 0) {
      this.loadHomeConnectionRoutes(announcement);
    } else {
      this.resetHomeConnectionState();
    }
  }

  isAnnouncementMarkerVisible(announcement: any): boolean {
    return !this.showInfo || String(announcement?.id) !== String(this.currentAnnouce?.id);
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
    this.deactivateMapRoute(transport?.ri);
    this.unhoverMapRoute(transport?.ri);
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
        const currentTransport = this.transports.find((elem: any) => elem.ri == number);
        const commuteRoute = this.commuteRoutes.find((route) => Number(route.ri) === Number(number));
        const usedColors = this.selectRoutes.map((item: any) => item.color).filter(Boolean);
        let color: string | undefined = currentTransport?.color || commuteRoute?.color;
        if (!color) color = TOP_COLORS.find((candidate) => !usedColors.includes(candidate));
        if (!color) color = TOP_COLORS[this.selectRoutes.length % TOP_COLORS.length];
        const type = commuteRoute?.type || currentTransport?.type || 'BUS';
        const name = commuteRoute?.name || currentTransport?.name || String(number);
        busRoutes.color = color;
        busRoutes.ri = number;
        busRoutes.title = `${this.transportTypeLabel(type)} ${name}`;
        if (commuteRoute?.homeDistanceMeters !== null && commuteRoute?.homeDistanceMeters !== undefined) {
          const destinationDistance = commuteRoute.distanceMeters !== null
            ? ` · Muhim manzilgacha: ${commuteRoute.distanceMeters} m`
            : '';
          busRoutes.description = `Uygacha: ${commuteRoute.homeDistanceMeters} m${destinationDistance}`;
        } else {
          busRoutes.description = commuteRoute?.distanceMeters !== null && commuteRoute?.distanceMeters !== undefined
            ? `Muhim manzilgacha: ${commuteRoute.distanceMeters} m`
            : 'Tanlangan transport yo‘nalishi';
        }
        if (currentTransport) currentTransport.color = color;
        this.transports = [...this.transports];
        this.selectRoutes.push(busRoutes);
        let selectedRies: any = this.routeTransports;
        this.selectRoutes = this.selectRoutes
          .filter((elem: any) => selectedRies.some((ri: any) => Number(ri) === Number(elem.ri)))
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
      this.announcementCount = Number(response?.count ?? results.length);
      this.announcements = results
        .map((item: any) => this.normalizeAnnouncement(item))
        .filter(Boolean);
      if (this.deepLinkedAnnouncement && this.deepLinkedAnnouncement.deal_type === this.currentDealType) {
        this.announcements = [
          this.deepLinkedAnnouncement,
          ...this.announcements.filter((item: any) => item.id !== this.deepLinkedAnnouncement.id),
        ];
        this.focusDeepLinkedAnnouncement();
      } else if (!this.commuteDestination && this.announcements.length > 0) {
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
    this.bottomSheetInfo?.close();
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
    if (this.routeDisplayOverride !== null) {
      this.routeTransports = [...this.routeDisplayOverride];
      return;
    }
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

  private isMapRouteFocused(routeId: any): boolean {
    const key = this.routeKey(routeId);
    return key === this.activeMapRouteId || key === this.hoveredMapRouteId;
  }

  private transportTypeLabel(type: string): string {
    if (type === 'METRO') return 'Metro';
    if (type === 'MARSHUTKA') return 'Marshrutka';
    return 'Avtobus';
  }

  private loadCommuteRoutes(destination: CommuteDestination): void {
    this.nearbyRoutesSubscription?.unsubscribe();
    this.nearbyRoutesSubscription = this.requestService.requestData<NearbyRoutesResponse>(
      environment.urls.POST_LOCATIONBUSES,
      'POST',
      {
        city: 'tashkent',
        location: {
          type: 'Point',
          coordinates: [destination.coordinates[1], destination.coordinates[0]],
        },
        nearby: this.commuteRadiusMeters,
      },
    ).pipe(
      finalize(() => {
        this.commuteLoading = false;
      }),
    ).subscribe({
      next: (response) => this.applyCommuteRoutes(destination, response),
      error: () => {
        this.commuteError = 'Yaqin transport yo‘nalishlarini topib bo‘lmadi.';
      },
    });
  }

  private applyCommuteRoutes(destination: CommuteDestination, response: NearbyRoutesResponse): void {
    const routeIds = normalizeNearbyRouteIds(response);
    this.resetHomeConnectionState();
    this.showInfo = false;
    this.commuteError = '';
    this.commuteDestination = destination;
    this.mapCenter = [...destination.coordinates];
    this.zoom = 14;
    this.clearSelectedRoutes();

    const distances = new Map(
      (response.route_distances || []).map((item) => [String(item.ri), Number(item.distance_m)]),
    );
    this.destinationRoutes = routeIds.map((ri, index) => {
      const transport = this.transports.find((item: any) => Number(item.ri) === Number(ri));
      const distance = distances.get(ri);
      const color = TOP_COLORS[index % TOP_COLORS.length];
      if (transport) transport.color = color;
      return {
        ri,
        name: transport?.name || ri,
        type: transport?.type || 'BUS',
        color,
        distanceMeters: Number.isFinite(distance) ? Math.round(distance as number) : null,
      };
    });
    this.commuteRoutes = this.destinationRoutes.map((route) => ({ ...route }));
    this.transports = [...this.transports];

    if (routeIds.length === 0) {
      this.announcements = [];
      this.announcementCount = 0;
      this.destinationRoutes = [];
      this.commuteError = 'Bu manzil yaqinidan to‘g‘ridan-to‘g‘ri transport topilmadi.';
      void this.queryService.updateCustomQuery({ transports: null });
      return;
    }

    this.routeTransports = routeIds;
    void this.queryService.updateCustomQuery({ transports: routeIds }, this.__GET_ANNOUNCEMENTS).then(() => {
      routeIds.forEach((routeId) => this.handleBusRoute(routeId));
      this.selectedTransportsGenerateFirst();
    });
  }

  private loadHomeConnectionRoutes(announcement: any): void {
    const coordinates = resolveAnnouncementCoordinates(announcement);
    if (!coordinates || !this.commuteDestination) return;

    this.homeRoutesSubscription?.unsubscribe();
    this.homeConnectionLoading = true;
    this.homeConnectionError = '';
    this.clearSelectedRoutes();
    this.routeDisplayOverride = [];
    this.commuteRoutes = [];
    this.focusConnectionBounds(coordinates);

    this.homeRoutesSubscription = this.requestService.requestData<NearbyRoutesResponse>(
      environment.urls.POST_LOCATIONBUSES,
      'POST',
      {
        city: 'tashkent',
        location: {
          type: 'Point',
          coordinates: [coordinates[1], coordinates[0]],
        },
        nearby: this.homeRadiusMeters,
      },
    ).pipe(
      finalize(() => {
        this.homeConnectionLoading = false;
      }),
    ).subscribe({
      next: (response) => this.applyHomeConnectionRoutes(response),
      error: () => {
        this.homeConnectionError = 'Uy yaqinidagi transportlarni tekshirib bo‘lmadi.';
      },
    });
  }

  private applyHomeConnectionRoutes(response: NearbyRoutesResponse): void {
    const homeRouteIds = new Set(normalizeNearbyRouteIds(response));
    const homeDistances = new Map(
      (response.route_distances || []).map((item) => [String(item.ri), Number(item.distance_m)]),
    );
    const matchingRoutes = this.destinationRoutes
      .filter((route) => homeRouteIds.has(route.ri))
      .map((route) => {
        const homeDistance = homeDistances.get(route.ri);
        return {
          ...route,
          homeDistanceMeters: Number.isFinite(homeDistance) ? Math.round(homeDistance as number) : null,
        };
      });

    this.applyVisibleRoutes(matchingRoutes, matchingRoutes.map((route) => route.ri));
    if (matchingRoutes.length === 0) {
      this.homeConnectionError = 'Bu uy va tanlangan manzil yaqinidan o‘tadigan umumiy transport topilmadi.';
    }
  }

  private applyVisibleRoutes(routes: CommuteRoute[], override: string[]): void {
    this.clearSelectedRoutes();
    this.routeDisplayOverride = [...override];
    this.commuteRoutes = routes.map((route) => ({ ...route }));
    this.routeTransports = [...override];
    routes.forEach((route) => {
      const transport = this.transports.find((item: any) => Number(item.ri) === Number(route.ri));
      if (transport) transport.color = route.color;
    });
    this.transports = [...this.transports];
    override.forEach((routeId) => this.handleBusRoute(routeId));
    this.selectedTransportsGenerateFirst();
  }

  private restoreDestinationRoutes(): void {
    const connectionWasActive = this.routeDisplayOverride !== null;
    this.resetHomeConnectionState();
    if (!connectionWasActive || !this.commuteDestination) return;

    this.applyVisibleRoutes(
      this.destinationRoutes.map((route) => ({ ...route, homeDistanceMeters: null })),
      this.destinationRoutes.map((route) => route.ri),
    );
    this.routeDisplayOverride = null;
    this.mapCenter = [...this.commuteDestination.coordinates];
    this.zoom = 14;
  }

  private resetHomeConnectionState(): void {
    this.homeRoutesSubscription?.unsubscribe();
    this.homeConnectionLoading = false;
    this.homeConnectionError = '';
    this.routeDisplayOverride = null;
  }

  private focusConnectionBounds(homeCoordinates: MapCoordinate): void {
    if (!this.commuteDestination) return;
    const destinationCoordinates = this.commuteDestination.coordinates;
    const bounds = [
      [
        Math.min(destinationCoordinates[0], homeCoordinates[0]),
        Math.min(destinationCoordinates[1], homeCoordinates[1]),
      ],
      [
        Math.max(destinationCoordinates[0], homeCoordinates[0]),
        Math.max(destinationCoordinates[1], homeCoordinates[1]),
      ],
    ];
    this.mapCenter = [
      (destinationCoordinates[0] + homeCoordinates[0]) / 2,
      (destinationCoordinates[1] + homeCoordinates[1]) / 2,
    ];

    const map = this.yandexMap;
    if (!map || typeof window === 'undefined') {
      this.zoom = 13;
      return;
    }
    const zoomMargin = window.innerWidth <= 768 ? [120, 40, 360, 40] : [80, 80, 80, 400];
    window.setTimeout(() => {
      Promise.resolve(map.setBounds(bounds, { checkZoomRange: true, zoomMargin })).then(() => {
        if (map.getZoom() > 15) map.setZoom(15);
        this.zoom = map.getZoom();
      });
    });
  }

  private clearSelectedRoutes(): void {
    this.routeTransports = [];
    this.selectRoutes = [];
    this.activeMapRouteId = null;
    this.hoveredMapRouteId = null;
    this.selectedTransports = { bus: [], miniBus: [], subway: [] };
    this.transports.forEach((transport: any) => delete transport.color);
  }
}
