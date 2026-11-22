import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { DictionaryService, RegionOption } from '@/core/services/dictionary/dictionary.service';
import { QueryService } from '@services/query';
import { finalize, Subscription } from 'rxjs';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_DISTRICT, DEFAULT_MAP_REGION, DEFAULT_MAP_ZOOM, MAP_CITY_NAME, TOP_COLORS } from '@/core/constants/map';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList } from '@services/interfaces';
import { FormsModule } from '@angular/forms';
import { AnnouncementsCardComponent } from '../../shared/components/cards/announcements-card/announcements-card.component';
import { DialogModule } from 'primeng/dialog';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { MapHeaderComponent } from './map-header.component';
import { LucideBusFront, LucideCheck, LucideCrosshair, LucideLocateFixed, LucideMapPin, LucideMinus, LucidePlus, LucideSearch, LucideX } from '@lucide/angular';
import { resolveAnnouncementCoordinates } from '@/core/geo';
import { parseRoutePath, routeLengthMeters } from '@components/announcement/price-block/transport-route.utils';
import {
  CommuteDestination,
  coordinatesBounds,
  MapBounds,
  extractCommuteDestinations,
  GeocodeSearchResponse,
  MapCoordinate,
  NearbyRoutesResponse,
  normalizeNearbyRouteIds,
} from './commute-search.utils';

const TRANSPORT_TABS = [
  { label: 'Avtobus', type: 'BUS' },
  { label: 'Marshrutka', type: 'MARSHUTKA' },
  { label: 'Metro', type: 'METRO' },
] as const;
type MapPanel = 'destination' | 'routes';
type TransportTab = (typeof TRANSPORT_TABS)[number];

interface MapTransport {
  ri: string;
  name: string;
  type: string;
  number?: string;
  stops?: string;
  lengthLabel?: string;
  color?: string;
  has_geometry?: boolean;
  geometry_is_approximate?: boolean;
  scheme_url?: string;
  passport_url?: string;
  map_url?: string;
}

interface RouteDetail {
  scheme?: { forward?: string; backward?: string };
  geometry_sources?: Record<string, { source_type?: string }>;
}

interface RouteShape {
  x: MapCoordinate[];
  y: MapCoordinate[];
  bounds: MapBounds;
  lengthLabel: string;
}

interface MapRoute extends RouteShape {
  ri: string;
  color: string;
  title: string;
  description: string;
}

const kilometers = new Intl.NumberFormat('uz-UZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const routeCityPrefix = new RegExp(`^(\\d+[a-z]*\\s*[·.]\\s*)?${MAP_CITY_NAME}\\s+[—–-]\\s*`, 'iu');
const cityAddressPart = new RegExp(`^${MAP_CITY_NAME}(?:\\s+(?:shahri|viloyati))?$`, 'iu');
const routeSearchText = (text: string) => text.trim().toLowerCase().replace(/['‘’ʻʼ]/g, '');

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
  imports: [MapHeaderComponent, DialogModule, FormsModule, AngularYandexMapsModule, NgIf, NgForOf,
    AnnouncementsCardComponent, LucideBusFront, LucideCheck, LucideCrosshair,
    LucideLocateFixed, LucideMapPin, LucideMinus, LucidePlus, LucideSearch, LucideX],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewport') private mapViewport?: ElementRef<HTMLElement>;
  public panel: MapPanel = 'destination';
  public sheetOpen = false;
  private sheetLauncher?: HTMLButtonElement;
  private viewportObserver?: ResizeObserver;
  public regions: RegionOption[] = [];
  public districts: RegionOption[] = [];
  public selectedRegion: number | null = null;
  public selectedDistrict: number | null = null;
  public locationLoading = true;
  public locationError = '';
  public listingsLoaded = false;
  public listingsError = false;
  private regionSubscription?: Subscription;
  private districtSubscription?: Subscription;
  private announcementsSubscription?: Subscription;
  private transportsSubscription?: Subscription;
  private deepLinkSubscription?: Subscription;
  private routeRequests = new Subscription();
  private readonly routeShapes = new Map<string, RouteShape>();
  public transportType: TransportTab['type'] = 'BUS';
  public transportTypes: TransportTab[] = [];
  public transportSearch = '';
  public showInfo = false;
  public mapCenter: number[] = [...DEFAULT_MAP_CENTER];
  public transports: MapTransport[] = [];
  public transportLinks: { name: string; href: string }[] = [];
  public usesDigitizedRoutes = false;
  public mapReady = false;
  public mapLoadSlow = false;
  public transportCatalogLoading = true;
  public transportLoadError = false;
  public routeError = '';
  public loadingRouteIds = new Set<string>();
  public selectRoutes: MapRoute[] = [];
  public routeTransports: string[] = [];
  public announcements: any = [];
  public currentAnnouce: any = {};
  public zoom = DEFAULT_MAP_ZOOM;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  public destinationQuery = '';
  public destinationMode: 'search' | 'map' = 'search';
  public destinationSuggestions: CommuteDestination[] = [];
  public commuteDestination: CommuteDestination | null = null;
  public pendingDestination: CommuteDestination | null = null;
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
    controls: ['trafficControl', 'typeSelector', 'fullscreenControl'],
  };
  private dealTypeSubscription?: Subscription;
  private geocodeSubscription?: Subscription;
  private nearbyRoutesSubscription?: Subscription;
  private homeRoutesSubscription?: Subscription;
  private destinationRoutes: CommuteRoute[] = [];
  private routeDisplayOverride: string[] | null = null;
  private yandexMap?: ymaps.Map;
  private mapLoadTimer?: ReturnType<typeof setTimeout>;
  private deepLinkedAnnouncement: any | null = null;

  get transportLoading(): boolean {
    return this.loadingRouteIds.size > 0;
  }

  get homeConnectionActive(): boolean {
    return this.routeDisplayOverride !== null && Boolean(this.commuteDestination);
  }

  get displayedCommuteDestination(): CommuteDestination | null {
    return this.pendingDestination ?? this.commuteDestination;
  }

  get visibleTransports(): MapTransport[] {
    const query = routeSearchText(this.transportSearch);
    return this.transports.filter((transport) =>
      transport.type === this.transportType && routeSearchText(transport.name).includes(query),
    );
  }

  get listQueryParams(): Record<string, unknown> {
    const { announcement, ...query } = this.queryService.activeQueryListWithoutDefault();
    const region = this.selectedDistrict ?? this.selectedRegion;
    return region ? { ...query, region } : query;
  }

  isTransportLoading(transport: any): boolean {
    return this.loadingRouteIds.has(this.routeKey(transport?.ri ?? transport));
  }

  isTransportSelected(transport: any): boolean {
    return this.routeTransports.some((ri: any) => Number(ri) === Number(transport?.ri));
  }

  constructor(
    public router: Router,
    private changeDetector: ChangeDetectorRef,
    private queryService: QueryService,
    private requestService: RequestService,
    private dealTypeService: DealTypeService,
    private dictionaryService: DictionaryService,
  ) {}

  ngOnInit() {
    this.loadLocationFilters();
    if (typeof window !== 'undefined') {
      this.applyDealTypeFromQuery();
      this.refreshRouteTransports();
      if (this.routeTransports.length) this.panel = 'routes';
      this.mapLoadTimer = setTimeout(() => {
        this.mapLoadSlow = true;
        this.changeDetector.markForCheck();
      }, 12_000);
    }
    this.dealTypeSubscription = this.dealTypeService.dealType$.subscribe((type) => {
      this.currentDealType = type;
      this.syncDealTypeQuery(type);
    });
    this.loadDeepLinkedAnnouncement();
  }

  ngOnDestroy(): void {
    clearTimeout(this.mapLoadTimer);
    this.viewportObserver?.disconnect();
    this.regionSubscription?.unsubscribe();
    this.districtSubscription?.unsubscribe();
    this.announcementsSubscription?.unsubscribe();
    this.transportsSubscription?.unsubscribe();
    this.deepLinkSubscription?.unsubscribe();
    this.routeRequests.unsubscribe();
    this.dealTypeSubscription?.unsubscribe();
    this.geocodeSubscription?.unsubscribe();
    this.nearbyRoutesSubscription?.unsubscribe();
    this.homeRoutesSubscription?.unsubscribe();
  }

  get selectedSearchArea(): RegionOption | undefined {
    return this.districts.find((area) => area.id === this.selectedDistrict)
      ?? this.regions.find((area) => area.id === this.selectedRegion);
  }

  loadLocationFilters(): void {
    this.regionSubscription?.unsubscribe();
    this.locationLoading = true;
    this.locationError = '';
    this.regionSubscription = this.dictionaryService.loadRegions().subscribe({
      next: (regions) => {
        this.regions = regions;
        const requestedId = Number(this.queryService.activeQueryList()['region']);
        const districtId = Number(this.queryService.activeQueryList()['district']) || undefined;
        const requestedRegion = regions.find((region) => region.id === requestedId);
        const defaultRegion = regions.find((region) => region.name.toLowerCase() === DEFAULT_MAP_REGION.toLowerCase());
        if (requestedRegion) {
          this.loadDistrictFilters(requestedRegion.id, districtId);
        } else if (Number.isInteger(requestedId) && requestedId > 0) {
          this.districtSubscription = this.requestService.getData<RegionOption>(
            `${environment.urls.GET_REGION_DETAIL}${requestedId}`,
          ).subscribe({
            next: (district) => this.loadDistrictFilters(district.parent ?? defaultRegion?.id ?? regions[0]?.id, district.id),
            error: () => this.loadDistrictFilters(defaultRegion?.id ?? regions[0]?.id, undefined, true),
          });
        } else {
          this.loadDistrictFilters(defaultRegion?.id ?? regions[0]?.id, districtId, true);
        }
      },
      error: () => {
        this.locationError = 'Hududlarni yuklab bo‘lmadi.';
        this.transportCatalogLoading = false;
        this.locationLoading = false;
      },
    });
  }

  private loadDistrictFilters(regionId: number | undefined, districtId?: number, useDefaultCity = false): void {
    if (!regionId) {
      this.locationError = 'Qidirish uchun hudud topilmadi.';
      this.transportCatalogLoading = false;
      this.locationLoading = false;
      return;
    }
    this.selectedRegion = regionId;
    this.selectedDistrict = null;
    this.districts = [];
    this.locationLoading = true;
    this.districtSubscription?.unsubscribe();
    this.districtSubscription = this.dictionaryService.loadDistricts(regionId).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.selectedDistrict = districts.find((district) => district.id === districtId)?.id
          ?? (useDefaultCity ? districts.find((district) => district.name.toLowerCase() === DEFAULT_MAP_DISTRICT.toLowerCase())?.id ?? null : null);
        this.locationLoading = false;
        if (!this.queryService.activeQueryList()['announcement']) this.focusSearchArea();
        this.__GET_TRANSPORTS();
        this.activeTransports();
        this.__GET_ANNOUNCEMENTS();
      },
      error: () => {
        this.locationLoading = false;
        this.locationError = 'Tumanlar yuklanmadi. Viloyat bo‘yicha qidirilyapti.';
        this.__GET_TRANSPORTS();
        this.activeTransports();
        this.__GET_ANNOUNCEMENTS();
      },
    });
  }

  handleRegionChange(region: number): void {
    this.selectedRegion = region;
    this.resetLocationSearch();
    this.locationLoading = true;
    this.districtSubscription?.unsubscribe();
    void this.queryService.updateCustomQuery({ region, district: null, transports: null, announcement: null }).then(() => {
      if (this.selectedRegion === region) this.loadDistrictFilters(region);
    });
  }

  handleDistrictChange(district: number | null): void {
    this.selectedDistrict = district;
    this.resetLocationSearch();
    this.focusSearchArea();
    this.__GET_TRANSPORTS();
    void this.queryService.updateCustomQuery(
      {region: this.selectedDistrict ?? this.selectedRegion, district: null, transports: null, announcement: null},
      this.__GET_ANNOUNCEMENTS,
    );
  }

  private resetLocationSearch(): void {
    this.resetCommuteSearch();
    this.announcementsSubscription?.unsubscribe();
    this.transportsSubscription?.unsubscribe();
    this.deepLinkSubscription?.unsubscribe();
    this.announcements = [];
    this.announcementCount = 0;
    this.transports = [];
    this.transportLinks = [];
    this.transportTypes = [];
    this.transportSearch = '';
    this.usesDigitizedRoutes = false;
    this.listingsLoaded = false;
    this.routeRequests.unsubscribe();
    this.routeRequests = new Subscription();
    this.routeShapes.clear();
    this.locationError = '';
    this.transportCatalogLoading = true;
    this.deepLinkedAnnouncement = null;
    this.showInfo = false;
  }

  private focusSearchArea(): void {
    const region = this.regions.find((area) => area.id === this.selectedRegion);
    this.mapCenter = [...(this.selectedSearchArea?.map_center ?? region?.map_center ?? DEFAULT_MAP_CENTER)];
    this.zoom = this.selectedDistrict || !region ? DEFAULT_MAP_ZOOM : 9;
  }

  private searchRegionParams(): {region?: number; district?: number} {
    return {
      ...(this.selectedRegion ? {region: this.selectedRegion} : {}),
      ...(this.selectedDistrict ? {district: this.selectedDistrict} : {}),
    };
  }

  private get transportCity(): string {
    return this.regions.find((region) => region.id === this.selectedRegion)?.name.toLowerCase().includes('toshkent')
      ? 'tashkent' : 'namangan';
  }

  searchCommuteDestination(): void {
    const query = this.destinationQuery.trim();
    if (query.length < 3 || this.commuteLoading || this.locationLoading) {
      if (query.length < 3) this.commuteError = 'Manzil yoki joy nomini kiriting.';
      return;
    }

    this.commuteLoading = true;
    this.commuteError = '';
    this.destinationSuggestions = [];
    this.pendingDestination = null;
    this.destinationMode = 'search';
    this.selectingDestination = false;
    this.geocodeSubscription?.unsubscribe();
    this.geocodeSubscription = this.requestService.getData<GeocodeSearchResponse>(
      environment.urls.GET_GEOCODE,
      { q: query, city: this.transportCity, ...this.searchRegionParams() },
    ).subscribe({
      next: (result) => {
        this.commuteLoading = false;
        const destinations = extractCommuteDestinations(result, query);
        if (destinations.length === 0) {
          this.commuteError = 'Tanlangan hududda bu manzil topilmadi. Aniqroq nom yoki manzil kiriting.';
          return;
        }
        this.destinationSuggestions = destinations.map((destination) => {
          const parts = destination.label.split(',').map((part) => part.trim()).filter(Boolean);
          const label = parts.filter((part) => !cityAddressPart.test(part)).join(', ');
          return { ...destination, label: label || 'Shahar markazi' };
        });
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
    this.resetCommuteSearch();
    void this.queryService.updateCustomQuery({ transports: null }, this.__GET_ANNOUNCEMENTS);
  }

  private resetCommuteSearch(): void {
    this.geocodeSubscription?.unsubscribe();
    this.nearbyRoutesSubscription?.unsubscribe();
    this.homeRoutesSubscription?.unsubscribe();
    this.destinationQuery = '';
    this.destinationMode = 'search';
    this.destinationSuggestions = [];
    this.commuteDestination = null;
    this.pendingDestination = null;
    this.commuteRoutes = [];
    this.destinationRoutes = [];
    this.commuteError = '';
    this.homeConnectionError = '';
    this.commuteLoading = false;
    this.homeConnectionLoading = false;
    this.selectingDestination = false;
    this.routeDisplayOverride = null;
    this.clearSelectedRoutes();
  }

  toggleSheet(panel: MapPanel, launcher: HTMLButtonElement): void {
    this.sheetLauncher = launcher;
    this.sheetOpen = this.panel !== panel || !this.sheetOpen;
    this.panel = panel;
    if (this.selectingDestination) this.setDestinationMode('search');
  }

  closeSheet(): void {
    this.sheetOpen = false;
    this.sheetLauncher?.focus({ preventScroll: true });
  }

  dismissMapTool(event: Event): void {
    if (this.showInfo) return;
    if (this.selectingDestination) {
      this.setDestinationMode('search');
      this.sheetLauncher?.focus({ preventScroll: true });
    } else if (this.sheetOpen) {
      this.closeSheet();
    } else {
      return;
    }
    event.stopPropagation();
  }

  adjustZoom(delta: number): void {
    const map = this.yandexMap;
    if (map) void map.setZoom(map.getZoom() + delta, { checkZoomRange: true });
  }

  fitMapView(): void {
    if (this.showInfo && this.currentAnnouce?.geometry) {
      if (this.commuteDestination) this.focusConnectionBounds(this.currentAnnouce.geometry);
      else void this.yandexMap?.setCenter(this.currentAnnouce.geometry, 15);
    } else if (this.selectRoutes.length) {
      this.fitSelectedRoutes();
    } else {
      this.focusSearchArea();
      const center = this.commuteDestination?.coordinates ?? this.mapCenter;
      void this.yandexMap?.setCenter(center, this.commuteDestination ? 15 : this.zoom);
    }
  }

  selectMapCenter(): void {
    const center = this.yandexMap?.getCenter();
    if (center) this.selectCommuteDestination({ label: 'Xaritada tanlangan nuqta', coordinates: [center[0], center[1]] });
  }

  trackRoute(_index: number, route: { ri: string }): string {
    return route.ri;
  }

  trackAnnouncement(_index: number, item: { id: number }): number {
    return item.id;
  }

  setDestinationMode(mode: 'search' | 'map'): void {
    if (this.commuteLoading) return;
    this.destinationMode = mode;
    this.selectingDestination = mode === 'map';
    this.destinationSuggestions = [];
    this.commuteError = '';
    if (this.selectingDestination) {
      this.sheetOpen = false;
      this.focusMapViewport();
    }
  }

  private focusMapViewport(): void {
    const viewport = this.mapViewport?.nativeElement;
    viewport?.scrollIntoView({ block: 'nearest' });
    viewport?.focus({ preventScroll: true });
  }

  showRoutesOnMap(): void {
    this.sheetOpen = false;
    this.fitSelectedRoutes();
    this.focusMapViewport();
  }

  private fitSelectedRoutes(): void {
    const map = this.yandexMap;
    if (!map || !this.selectRoutes.length) return;
    const bounds = coordinatesBounds(this.selectRoutes.map((route) => route.bounds));
    if (bounds) void map.setBounds(bounds, { checkZoomRange: true, zoomMargin: [36, 36, 36, 36] });
  }

  handleDestinationQueryChange(): void {
    this.destinationSuggestions = [];
    this.commuteError = '';
    this.destinationMode = 'search';
    this.selectingDestination = false;
  }

  clearDestinationQuery(): void {
    if (this.commuteLoading) return;
    this.destinationQuery = '';
    this.destinationSuggestions = [];
    this.commuteError = '';
  }

  selectCommuteDestination(destination: CommuteDestination): void {
    if (this.commuteLoading) return;
    this.deepLinkSubscription?.unsubscribe();
    this.deepLinkedAnnouncement = null;
    this.panel = 'destination';
    this.sheetOpen = true;
    this.deepLinkSubscription?.unsubscribe();
    this.deepLinkedAnnouncement = null;
    this.geocodeSubscription?.unsubscribe();
    this.destinationQuery = '';
    this.destinationSuggestions = [];
    this.destinationMode = 'search';
    this.selectingDestination = false;
    this.commuteError = '';
    this.pendingDestination = destination;
    this.commuteLoading = true;
    this.loadCommuteRoutes(destination);
  }

  destinationPrimaryLabel(label: string): string {
    return label.split(',')[0]?.trim() || label;
  }

  destinationSecondaryLabel(label: string): string {
    return label.split(',').slice(1).join(',').trim();
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
    this.selectCommuteDestination(destination);
  }

  handleMapBoundsChange(event: { target?: any; event?: any }): void {
    const nextZoom = Number(event.event?.get?.('newZoom') ?? event.target?.getZoom?.());
    if (Number.isFinite(nextZoom)) this.zoom = nextZoom;
  }

  handleMapReady(event: any): void {
    this.yandexMap = event?.target;
    this.mapReady = Boolean(this.yandexMap);
    if (this.mapReady) {
      clearTimeout(this.mapLoadTimer);
      const viewport = this.mapViewport?.nativeElement;
      if (viewport && typeof ResizeObserver !== 'undefined') {
        this.viewportObserver?.disconnect();
        this.viewportObserver = new ResizeObserver(() => this.yandexMap?.container.fitToViewport());
        this.viewportObserver.observe(viewport);
      }
    }
    this.changeDetector.markForCheck();
    if (this.panel === 'routes' && !this.showInfo) this.fitSelectedRoutes();
  }

  reloadMap(): void {
    window.location.reload();
  }

  activateMapRoute(routeId: any): void {
    this.activeMapRouteId = this.routeKey(routeId);
  }

  showMapRoute(routeId: any, event: any): void {
    event?.event?.stopPropagation?.();
    if (this.selectingDestination) {
      this.handleDestinationMapClick(event);
      return;
    }
    this.activateMapRoute(routeId);
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


  closeAnnouncementInfo = () => {
    this.showInfo = false;
    if (this.deepLinkedAnnouncement) {
      this.deepLinkedAnnouncement = null;
      void this.queryService.updateCustomQuery({ announcement: null });
    }
    this.restoreDestinationRoutes();
  };

  handleAnnouncementDialogHide(): void {
    this.closeAnnouncementInfo();
  }

  handleAnnounce(id: number) {
    const announcement = this.announcements.find((elem: any) => elem.id == id);
    if (!announcement) return;

    this.currentAnnouce = announcement;
    this.showInfo = true;
    if (this.commuteDestination && this.destinationRoutes.length > 0) {
      this.loadHomeConnectionRoutes(announcement);
    } else {
      this.resetHomeConnectionState();
    }
  }

  isAnnouncementMarkerVisible(announcement: any): boolean {
    return !this.showInfo || String(announcement?.id) !== String(this.currentAnnouce?.id);
  }

  activeTransports(): void {
    this.refreshRouteTransports();
    this.routeTransports.forEach((ri) => this.handleBusRoute(ri));
  }

  filterTransport(transport: MapTransport): void {
    const ri = String(transport.ri);
    this.panel = 'routes';
    const selected = this.isTransportSelected(transport);
    const routes = selected ? this.routeTransports.filter((item) => item !== ri) : [...this.routeTransports, ri];
    if (selected) {
      delete transport.color;
      this.deactivateMapRoute(ri);
      this.unhoverMapRoute(ri);
    }
    this.setManualRoutes(routes);
  }

  clearManualRoutes(): void {
    this.clearSelectedRoutes();
    this.setManualRoutes([]);
  }

  private setManualRoutes(routes: string[]): void {
    this.routeError = '';
    this.routeTransports = routes;
    this.selectRoutes = this.selectRoutes.filter((route) => routes.includes(route.ri));
    routes.forEach((ri) => this.handleBusRoute(ri));
    void this.queryService.updateCustomQuery({ transports: routes.length ? routes : null }, this.__GET_ANNOUNCEMENTS);
  }

  handleBusRoute(ri: string): void {
    if (this.selectRoutes.some((route) => route.ri === ri) || this.isTransportLoading(ri)) return;
    if (this.routeShapes.has(ri)) {
      this.drawTransportRoute(ri);
      return;
    }
    this.loadingRouteIds = new Set(this.loadingRouteIds).add(ri);
    this.routeRequests.add(this.requestService
      .requestData<RouteDetail>(
        environment.urls.POST_BUSROUTES, 'POST', { id: ri, city: this.transportCity },
      )
      .pipe(
        finalize(() => {
          const loadingRouteIds = new Set(this.loadingRouteIds);
          loadingRouteIds.delete(ri);
          this.loadingRouteIds = loadingRouteIds;
        })
      )
      .subscribe({
        next: (data) => {
          this.usesDigitizedRoutes ||= Object.values(data?.geometry_sources ?? {}).some(
            ({ source_type }) => source_type === 'digitized_official_scheme' || source_type === 'reconstructed_from_public_stops',
          );
          this.drawTransportRoute(ri, data?.scheme);
        },
        error: () => {
          if (this.routeTransports.includes(ri)) this.routeError = 'Yo‘nalish chizmasi yuklanmadi.';
        },
      }));
  }

  retryRouteShapes(): void {
    this.routeError = '';
    this.routeTransports.forEach((ri) => this.handleBusRoute(ri));
  }

  private drawTransportRoute(ri: string, scheme?: { forward?: string; backward?: string }): void {
    if (!this.routeTransports.includes(ri)) return;
    let shape = this.routeShapes.get(ri);
    if (!shape) {
      const x = parseRoutePath(scheme?.forward);
      const y = parseRoutePath(scheme?.backward);
      const bounds = coordinatesBounds([x, y]);
      if (!bounds || (x.length < 2 && y.length < 2)) {
        this.routeError = 'Bu yo‘nalishning chizig‘i topilmadi.';
        return;
      }
      const forward = routeLengthMeters(x);
      const backward = routeLengthMeters(y);
      const lengthLabel = [
        forward !== null ? `Borish ≈ ${kilometers.format(forward / 1000)} km` : '',
        backward !== null ? `Qaytish ≈ ${kilometers.format(backward / 1000)} km` : '',
      ].filter(Boolean).join(' · ');
      shape = { x, y, bounds, lengthLabel };
      this.routeShapes.set(ri, shape);
    }

    const transport = this.transports.find((item) => item.ri === ri);
    const commuteRoute = this.commuteRoutes.find((route) => route.ri === ri);
    const usedColors = new Set(this.selectRoutes.map((route) => route.color));
    const color = commuteRoute?.color ?? transport?.color
      ?? TOP_COLORS.find((candidate) => !usedColors.has(candidate))
      ?? TOP_COLORS[this.selectRoutes.length % TOP_COLORS.length];
    const type = commuteRoute?.type ?? transport?.type ?? 'BUS';
    const name = transport?.name ?? commuteRoute?.name ?? ri;
    const distances = [
      commuteRoute?.homeDistanceMeters != null ? `Uygacha ${commuteRoute.homeDistanceMeters} m` : '',
      commuteRoute?.distanceMeters != null ? `Muhim manzilgacha ${commuteRoute.distanceMeters} m` : '',
    ].filter(Boolean);
    const route: MapRoute = {
      ...shape, ri, color,
      title: `${this.transportTypeLabel(type)} ${name}`,
      description: distances.join(' · ') || 'Tanlangan transport yo‘nalishi',
    };
    if (transport) {
      transport.color = color;
      transport.lengthLabel = shape.lengthLabel;
    }
    this.selectRoutes = [...this.selectRoutes, route];
    if (this.panel === 'routes' && this.selectRoutes.length === 1 && !this.commuteDestination && !this.showInfo) {
      this.fitSelectedRoutes();
    }
  }
  __GET_ANNOUNCEMENTS = () => {
    if (this.locationLoading) return;
    const { announcement: _announcement, region, district, ...activeFilters } = this.queryService.activeQueryList();
    const params = {
      ...activeFilters,
      city: this.transportCity,
      map_region: this.selectedDistrict ?? this.selectedRegion,
      deal_type: this.currentDealType,
    };
    this.announcementsSubscription?.unsubscribe();
    this.listingsLoaded = false;
    this.listingsError = false;
    this.announcementsSubscription = this.requestService.getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.queryService.generatorHttpParams(params)).subscribe({
      next: (response) => {
        this.listingsLoaded = true;
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
        }
      },
      error: () => { this.listingsError = true; this.announcements = []; },
    });
  };

  private loadDeepLinkedAnnouncement(): void {
    const rawId = this.queryService.activeQueryList()['announcement'];
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isInteger(id) || id <= 0) return;

    this.deepLinkSubscription = this.requestService.getData<any>(`${environment.urls.GET_ANNONCEMENTS}${id}/`).subscribe({
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

  __GET_TRANSPORTS(): void {
    this.transportsSubscription?.unsubscribe();
    this.transportLoadError = false;
    this.transportCatalogLoading = true;
    this.transportsSubscription = this.requestService.getData<MapTransport[]>(environment.urls.GET_TRANSPORTS, { city: this.transportCity, ...this.searchRegionParams() }).pipe(
      finalize(() => { this.transportCatalogLoading = false; }),
    ).subscribe({
      next: (response) => {
        const catalog = (Array.isArray(response) ? response : []).filter((item) => item.ri != null).map((item) => {
          const name = item.name.replace(routeCityPrefix, (_, number: string | undefined) => number ?? '');
          const match = /^(\d+[a-zа-я]?)(?:\s*[·.]\s*(.+)|$)/iu.exec(name);
          return { ...item, ri: String(item.ri), name, number: match?.[1], stops: match?.[2] };
        });
        this.transportLinks = catalog.flatMap((item) => {
          const href = item.scheme_url || item.passport_url || item.map_url;
          return item.has_geometry === false && href ? [{ name: item.name, href }] : [];
        });
        this.usesDigitizedRoutes ||= catalog.some((item) => item.has_geometry && item.geometry_is_approximate);
        this.transports = catalog.filter((item) => item.has_geometry !== false).map((item) => {
          const route = this.selectRoutes.find((candidate) => candidate.ri === item.ri);
          if (route) {
            route.title = `${this.transportTypeLabel(item.type)} ${item.name}`;
            return { ...item, color: route.color, lengthLabel: route.lengthLabel };
          }
          return item;
        });
        this.transports.sort((first, second) =>
          first.name.localeCompare(second.name, 'uz', { numeric: true }),
        );
        this.transportTypes = TRANSPORT_TABS.filter((tab) => this.transports.some((item) => item.type === tab.type));
        this.transportType = this.transportTypes[0]?.type ?? 'BUS';
      },
      error: () => { this.transportLoadError = true; },
    });
  }

  private refreshRouteTransports(): void {
    if (this.routeDisplayOverride !== null) {
      this.routeTransports = [...this.routeDisplayOverride];
      return;
    }
    const value = this.queryService.activeQueryList()['transports'];
    this.routeTransports = (Array.isArray(value) ? value : value ? [value] : []).map(String);
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
        city: this.transportCity,
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
        this.pendingDestination = null;
        this.commuteError = 'Yaqin transport yo‘nalishlarini topib bo‘lmadi.';
      },
    });
  }

  private applyCommuteRoutes(destination: CommuteDestination, response: NearbyRoutesResponse): void {
    const routeIds = normalizeNearbyRouteIds(response);
    this.resetHomeConnectionState();
    this.showInfo = false;
    this.commuteError = '';
    this.pendingDestination = null;
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
      if (!this.transports.length) {
        this.commuteError = 'Bu hudud uchun transport yo‘nalishlari hozircha mavjud emas.';
        void this.queryService.updateCustomQuery({ transports: null, announcement: null }, this.__GET_ANNOUNCEMENTS);
        return;
      }
      this.announcements = [];
      this.announcementCount = 0;
      this.destinationRoutes = [];
      this.commuteError = response.geometry_available === false
        ? 'Yo‘nalish chiziqlari hozircha mavjud emas.'
        : 'Bu manzil yaqinidan to‘g‘ridan-to‘g‘ri transport topilmadi.';
      void this.queryService.updateCustomQuery({ transports: null, announcement: null });
      return;
    }

    this.routeTransports = routeIds;
    void this.queryService.updateCustomQuery({ transports: routeIds, announcement: null }, this.__GET_ANNOUNCEMENTS).then(() => {
      routeIds.forEach((routeId) => this.handleBusRoute(routeId));
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
        city: this.transportCity,
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
    const zoomMargin = window.innerWidth <= 768 ? [36, 36, 120, 36] : [44, 44, 44, 300];
    window.setTimeout(() => {
      Promise.resolve(map.setBounds(bounds, { checkZoomRange: true, zoomMargin })).then(() => {
        if (map.getZoom() > 15) map.setZoom(15);
        this.zoom = map.getZoom();
      });
    });
  }

  private clearSelectedRoutes(): void {
    this.routeError = '';
    this.routeTransports = [];
    this.selectRoutes = [];
    this.activeMapRouteId = null;
    this.hoveredMapRouteId = null;
    this.transports.forEach((transport: any) => delete transport.color);
  }
}
