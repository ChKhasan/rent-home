import { Component, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IAnnouncementInfo, Transport } from '@services/interfaces';
import { NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { Router, RouterLink } from '@angular/router';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AuthService } from '@services/auth';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { LucideArrowUpRight, LucideBusFront, LucideCarTaxiFront, LucideLoaderCircle, LucideMap, LucideMapPin, LucideRoute, LucideTrainFront, LucideX } from '@lucide/angular';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { finalize, Subscription } from 'rxjs';
import {
  findNearestRoutePoint,
  findNearestRouteStop,
  formatRouteDistance,
  MapCoordinate,
  parseRoutePath,
  parseRouteStops,
  RouteStop,
} from './transport-route.utils';
import { resolveAnnouncementCoordinates } from '@/core/geo';

type TransportType = Transport['type'];

interface TransportGroup {
  type: TransportType;
  label: string;
  items: Transport[];
}

interface TransportRouteStyle {
  color: string;
  forward: Record<string, unknown>;
  backward: Record<string, unknown>;
  stop: Record<string, unknown>;
  marker: Record<string, unknown>;
}

interface ActiveTransportRoute {
  transport: Transport;
  style: TransportRouteStyle;
  forward: MapCoordinate[];
  backward: MapCoordinate[];
  stops: RouteStop[];
  nearestStop: RouteStop | null;
  nearestPoint: MapCoordinate;
  distanceMeters: number;
  walkingDistanceMeters?: number;
  walkingPath?: MapCoordinate[];
}

type WalkingRouteStatus = 'idle' | 'loading' | 'ready' | 'error';

interface TransportRouteResponse {
  stops?: unknown;
  scheme?: {
    forward?: unknown;
    backward?: unknown;
  };
}

interface WalkingRouteResponse {
  distance_meters?: unknown;
  duration_seconds?: unknown;
  geometry?: {
    type?: unknown;
    coordinates?: unknown;
  };
}

interface AnnouncementUser {
  id: number;
  name?: string;
  phone_number?: string;
  images?: { image: string }[];
  is_online?: boolean;
  last_online?: string;
}

type PriceBlockAnnouncement = Omit<Partial<IAnnouncementInfo>, 'transports' | 'user'> & {
  transports?: readonly Transport[];
  user?: number | AnnouncementUser | null;
};

const TRANSPORT_LABELS: Record<TransportType, string> = {
  METRO: 'Metro',
  BUS: 'Avtobuslar',
  MARSHUTKA: 'Marshrutkalar',
};

const TRANSPORT_ORDER: TransportType[] = ['METRO', 'BUS', 'MARSHUTKA'];
const STOP_MARKER_MIN_ZOOM = 14;
const TRANSPORT_COLLATOR = new Intl.Collator('uz', { numeric: true, sensitivity: 'base' });
const STOP_ICON_PATHS: Record<TransportType, string> = {
  BUS: '<path d="M4 6 2 7"/><path d="M10 6h4"/><path d="m22 7-2-1"/><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 21v-2"/>',
  MARSHUTKA: '<path d="M10 2h4"/><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  METRO: '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
};
const TRANSPORT_ROUTE_STYLES: Record<TransportType, TransportRouteStyle> = {
  BUS: createRouteStyle('BUS', '#168a4f', 'islands#blueMassTransitIcon'),
  MARSHUTKA: createRouteStyle('MARSHUTKA', '#2563eb', 'islands#blueAutoIcon'),
  METRO: createRouteStyle('METRO', '#dc2626', 'islands#blueRapidTransitIcon'),
};

function createRouteStyle(type: TransportType, color: string, markerPreset: string): TransportRouteStyle {
  return {
    color,
    forward: { strokeColor: color, strokeWidth: 5, strokeOpacity: 0.92 },
    backward: { strokeColor: color, strokeWidth: 5, strokeOpacity: 0.76, strokeStyle: 'shortdash' },
    stop: createStopMarkerOptions(type, color),
    marker: { preset: markerPreset, iconColor: color, iconCaptionMaxWidth: 160, zIndex: 140 },
  };
}

function createStopMarkerOptions(type: TransportType, color: string): Record<string, unknown> {
  // Yandex marker images render outside Angular, so the matching Lucide geometry is embedded here.
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6" fill="${color}" stroke="white" stroke-width="2"/><g transform="translate(4 4) scale(.6667)" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${STOP_ICON_PATHS[type]}</g></svg>`;
  return {
    iconLayout: 'default#image',
    iconImageHref: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(icon)}`,
    iconImageSize: [20, 20],
    iconImageOffset: [-10, -10],
    zIndex: 110,
  };
}

@Component({
  selector: 'app-price-block',
  standalone: true,
  imports: [
    ButtonModule,
    AngularYandexMapsModule,
    RouterLink,
    NgIf,
    NgForOf,
    SkeletonModule,
    AuthDialogComponent,
    LucideArrowUpRight,
    LucideBusFront,
    LucideCarTaxiFront,
    LucideMap,
    LucideMapPin,
    LucideRoute,
    LucideTrainFront,
    LucideLoaderCircle,
    LucideX,
  ],
  templateUrl: './price-block.component.html',
  styleUrl: './price-block.component.css',
})
export class PriceBlockComponent implements OnDestroy {
  private _announcement: PriceBlockAnnouncement | null = null;

  @Input()
  set announcement(value: PriceBlockAnnouncement | null | undefined) {
    const listingChanged = this._announcement?.id !== value?.id;
    this._announcement = value ?? null;
    if (listingChanged) this.resetRouteState();
    this.transportGroups = this.groupTransports(value?.transports);
    this.mapCenter = resolveAnnouncementCoordinates(value);
  }

  get announcement(): PriceBlockAnnouncement | null {
    return this._announcement;
  }

  @Input() loading!: boolean;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  public transportGroups: TransportGroup[] = [];
  public mapCenter: MapCoordinate | null = null;
  public zoom = 13;
  public selectedTransport: Transport | null = null;
  public activeRoute: ActiveTransportRoute | null = null;
  public routeLoadingId: number | null = null;
  public routeError = '';
  public walkingRouteStatus: WalkingRouteStatus = 'idle';
  public showRouteStops = false;
  public readonly propertyMarkerOptions = { preset: 'islands#redHomeIcon', iconColor: '#dc2626' };
  public readonly walkingPathOptions = { strokeColor: '#111827', strokeWidth: 4, strokeOpacity: 0.9, strokeStyle: 'shortdash' };
  private mapInstance: any;
  private routeRequest?: Subscription;
  private walkingRouteRequest?: Subscription;
  private routeRequestVersion = 0;
  constructor(
    private router: Router,
    public authService: AuthService,
    private chatUrlService: ChatUrlService,
    private requestService: RequestService,
    private ngZone: NgZone,
  ) {}

  ngOnDestroy(): void {
    this.routeRequest?.unsubscribe();
    this.walkingRouteRequest?.unsubscribe();
  }
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
  toChat() {
    if (this.authService.auth && this.authService.user.id) {
      const user = this.announcement?.user;
      const userId = typeof user === 'number' ? user : user?.id;
      const userProfile = typeof user === 'object' && user !== null ? user : null;
      const announcementId = this.announcement?.id;
      if (!userId || !announcementId || userId === this.authService.user.id) return;
      this.chatUrlService.save(announcementId, {
        id: userId,
        name: userProfile?.name || "E'lon beruvchi",
        phone_number: userProfile?.phone_number,
        images: userProfile?.images || [],
        is_online: userProfile?.is_online,
        last_online: userProfile?.last_online,
      });
      const query = {
        userId,
      };
      this.router
        .navigate(['/profile/chat'], {
          queryParams: query,
        })
        .then(() => {});
    } else {
      this.openAuthDialog();
    }
  }

  trackTransport(_index: number, transport: Transport): number {
    return transport.id;
  }

  trackRouteStop(_index: number, stop: RouteStop): string {
    return stop.key;
  }

  isNearestStop(route: ActiveTransportRoute, stop: RouteStop): boolean {
    return route.nearestStop?.key === stop.key;
  }

  get mapQueryParams(): Record<string, string | number | null> {
    return {
      announcement: this.announcement?.id ?? null,
      transports: this.activeRoute?.transport.ri ?? null,
    };
  }

  onMapReady(event: { target: any }): void {
    this.mapInstance = event.target;
    this.updateRouteStopVisibility(this.mapInstance?.getZoom?.());
    if (this.activeRoute) this.fitMapToRoute();
  }

  onMapBoundsChange(event: { target?: any; event?: any }): void {
    const zoom = event.event?.get?.('newZoom') ?? event.target?.getZoom?.();
    this.updateRouteStopVisibility(zoom);
  }

  isRouteSelectable(transport: Transport): boolean {
    return !!this.mapCenter
      && TRANSPORT_ORDER.includes(transport.type)
      && /^\d+$/.test(String(transport.ri ?? '').trim());
  }

  isRouteSelected(transport: Transport): boolean {
    return this.selectedTransport?.id === transport.id;
  }

  isRouteLoading(transport: Transport): boolean {
    return this.routeLoadingId === transport.id;
  }

  routeDistance(route: ActiveTransportRoute): string {
    return formatRouteDistance(route.walkingDistanceMeters ?? route.distanceMeters);
  }

  routeDistanceText(route: ActiveTransportRoute): string {
    if (this.walkingRouteStatus === 'ready') {
      const destination = route.nearestStop ? 'Bekatgacha' : 'Yo‘nalishgacha';
      return `${destination} piyoda: ${this.routeDistance(route)}`;
    }
    if (this.walkingRouteStatus === 'loading') return 'Piyoda yo‘li hisoblanmoqda';
    return 'Piyoda yo‘lini hisoblab bo‘lmadi';
  }

  stopDirectionLabel(stop: RouteStop): string {
    return stop.direction === 'forward' ? 'Borish bekati' : 'Qaytish bekati';
  }

  transportRouteTitle(transport: Transport): string {
    if (transport.type === 'METRO') return `Metro: ${transport.name}`;
    if (transport.type === 'MARSHUTKA') return `Marshrutka ${transport.name}`;
    return `Avtobus ${transport.name}`;
  }

  selectTransportRoute(transport: Transport): void {
    if (!this.isRouteSelectable(transport)) return;
    if (this.isRouteSelected(transport) && this.activeRoute) {
      this.clearSelectedRoute();
      return;
    }

    const routeId = String(transport.ri).trim();
    const requestVersion = ++this.routeRequestVersion;
    this.routeRequest?.unsubscribe();
    this.resetWalkingRoute();
    this.selectedTransport = transport;
    this.activeRoute = null;
    this.routeError = '';
    this.routeLoadingId = transport.id;

    this.routeRequest = this.requestService
      .requestData<TransportRouteResponse>(environment.urls.POST_BUSROUTES, 'POST', { id: routeId })
      .pipe(finalize(() => {
        if (requestVersion === this.routeRequestVersion) this.routeLoadingId = null;
      }))
      .subscribe({
        next: (response) => {
          if (requestVersion !== this.routeRequestVersion || !this.mapCenter) return;
          const forward = parseRoutePath(response?.scheme?.forward);
          const backward = parseRoutePath(response?.scheme?.backward);
          const proximity = findNearestRoutePoint(this.mapCenter, [forward, backward]);
          if (!proximity) {
            this.routeError = "Bu transport yo'nalishini hozir xaritada ko'rsatib bo'lmadi.";
            return;
          }
          const stops = parseRouteStops(response?.stops);
          const stopProximity = findNearestRouteStop(this.mapCenter, stops);
          this.activeRoute = {
            transport,
            style: TRANSPORT_ROUTE_STYLES[transport.type],
            forward,
            backward,
            stops,
            nearestStop: stopProximity?.stop ?? null,
            nearestPoint: stopProximity?.stop.coordinate ?? proximity.nearestPoint,
            distanceMeters: stopProximity?.distanceMeters ?? proximity.distanceMeters,
          };
          this.loadWalkingRoute(requestVersion, this.activeRoute);
          setTimeout(() => this.fitMapToRoute());
        },
        error: () => {
          if (requestVersion === this.routeRequestVersion) {
            this.routeError = "Transport yo'nalishini yuklab bo'lmadi. Qayta urinib ko'ring.";
          }
        },
      });
  }

  clearSelectedRoute(): void {
    this.resetRouteState();
    if (this.mapCenter && this.mapInstance) {
      this.mapInstance.setCenter(this.mapCenter, this.zoom, { duration: 250, checkZoomRange: true });
    }
  }

  private groupTransports(transports: readonly Transport[] | null | undefined): TransportGroup[] {
    if (!Array.isArray(transports)) return [];

    return TRANSPORT_ORDER.map((type) => ({
      type,
      label: TRANSPORT_LABELS[type],
      items: transports
        .filter((transport) => transport.type === type && transport.name?.trim())
        .sort((first, second) => TRANSPORT_COLLATOR.compare(first.name, second.name)),
    })).filter((group) => group.items.length > 0);
  }

  private resetRouteState(): void {
    this.routeRequestVersion += 1;
    this.routeRequest?.unsubscribe();
    this.routeRequest = undefined;
    this.resetWalkingRoute();
    this.selectedTransport = null;
    this.activeRoute = null;
    this.routeLoadingId = null;
    this.routeError = '';
  }

  private resetWalkingRoute(): void {
    this.walkingRouteRequest?.unsubscribe();
    this.walkingRouteRequest = undefined;
    this.walkingRouteStatus = 'idle';
  }

  private loadWalkingRoute(requestVersion: number, activeRoute: ActiveTransportRoute): void {
    if (
      requestVersion !== this.routeRequestVersion
      || !this.mapCenter
      || this.activeRoute !== activeRoute
    ) return;

    const [startLatitude, startLongitude] = this.mapCenter;
    const [endLatitude, endLongitude] = activeRoute.nearestPoint;
    this.walkingRouteStatus = 'loading';

    const request = this.requestService
      .requestData<WalkingRouteResponse>(environment.urls.POST_WALKING_ROUTE, 'POST', {
        start: { latitude: startLatitude, longitude: startLongitude },
        end: { latitude: endLatitude, longitude: endLongitude },
      })
      .pipe(finalize(() => {
        if (requestVersion === this.routeRequestVersion) {
          this.walkingRouteRequest = undefined;
        }
      }))
      .subscribe({
        next: (response) => {
          if (requestVersion !== this.routeRequestVersion || this.activeRoute !== activeRoute) return;
          const distanceMeters = Number(response?.distance_meters);
          const walkingPath = this.parseWalkingRoutePath(response?.geometry?.coordinates);
          if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || walkingPath.length < 2) {
            this.walkingRouteStatus = 'error';
            return;
          }
          activeRoute.walkingDistanceMeters = distanceMeters;
          activeRoute.walkingPath = walkingPath;
          this.walkingRouteStatus = 'ready';
          setTimeout(() => this.fitMapToRoute());
        },
        error: () => {
          if (requestVersion === this.routeRequestVersion && this.activeRoute === activeRoute) {
            this.walkingRouteStatus = 'error';
          }
        },
      });
    this.walkingRouteRequest = request.closed ? undefined : request;
  }

  private parseWalkingRoutePath(value: unknown): MapCoordinate[] {
    if (!Array.isArray(value)) return [];
    return value.reduce<MapCoordinate[]>((path, coordinate) => {
      if (!Array.isArray(coordinate) || coordinate.length < 2) return path;
      const longitude = Number(coordinate[0]);
      const latitude = Number(coordinate[1]);
      if (
        Number.isFinite(latitude)
        && Number.isFinite(longitude)
        && Math.abs(latitude) <= 90
        && Math.abs(longitude) <= 180
      ) path.push([latitude, longitude]);
      return path;
    }, []);
  }

  private updateRouteStopVisibility(value: unknown): void {
    const visible = Number(value) >= STOP_MARKER_MIN_ZOOM;
    if (visible === this.showRouteStops) return;
    this.ngZone.run(() => {
      this.showRouteStops = visible;
    });
  }

  private fitMapToRoute(): void {
    if (!this.activeRoute || !this.mapCenter || !this.mapInstance) return;
    const walkingPath = this.activeRoute.walkingPath;
    const coordinates = walkingPath?.length
      ? [this.mapCenter, this.activeRoute.nearestPoint, ...walkingPath]
      : [this.mapCenter, ...this.activeRoute.forward, ...this.activeRoute.backward];
    const latitudes = coordinates.map((coordinate) => coordinate[0]);
    const longitudes = coordinates.map((coordinate) => coordinate[1]);
    const bounds = [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ];
    this.mapInstance.setBounds(bounds, {
      checkZoomRange: true,
      preciseZoom: true,
      zoomMargin: [36, 28, 36, 28],
      duration: 300,
    });
  }
}
