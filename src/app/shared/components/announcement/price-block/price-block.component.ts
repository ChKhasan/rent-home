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
import { findNearestRoutePoint, formatRouteDistance, MapCoordinate, parseRoutePath } from './transport-route.utils';
import { resolveAnnouncementCoordinates } from '@/core/geo';

type TransportType = Transport['type'];

interface TransportGroup {
  type: TransportType;
  label: string;
  items: Transport[];
}

interface TransportRouteStyle {
  color: string;
  forward: Record<string, string | number>;
  backward: Record<string, string | number>;
  marker: Record<string, string | number>;
}

interface ActiveTransportRoute {
  transport: Transport;
  style: TransportRouteStyle;
  forward: MapCoordinate[];
  backward: MapCoordinate[];
  nearestPoint: MapCoordinate;
  connector: MapCoordinate[];
  distanceMeters: number;
  walkingDistanceMeters?: number;
  walkingPath?: MapCoordinate[];
}

type WalkingRouteStatus = 'idle' | 'loading' | 'ready' | 'fallback';

interface TransportRouteResponse {
  scheme?: {
    forward?: unknown;
    backward?: unknown;
  };
}

interface WalkingRouteResponse {
  code?: string;
  routes?: Array<{
    distance?: unknown;
    geometry?: {
      coordinates?: unknown;
    };
  }>;
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
const TRANSPORT_COLLATOR = new Intl.Collator('uz', { numeric: true, sensitivity: 'base' });
const TRANSPORT_ROUTE_STYLES: Record<TransportType, TransportRouteStyle> = {
  BUS: createRouteStyle('#168a4f', 'islands#blueMassTransitIcon'),
  MARSHUTKA: createRouteStyle('#2563eb', 'islands#blueAutoIcon'),
  METRO: createRouteStyle('#dc2626', 'islands#blueRapidTransitIcon'),
};

function createRouteStyle(color: string, markerPreset: string): TransportRouteStyle {
  return {
    color,
    forward: { strokeColor: color, strokeWidth: 5, strokeOpacity: 0.92 },
    backward: { strokeColor: color, strokeWidth: 5, strokeOpacity: 0.76, strokeStyle: 'shortdash' },
    marker: { preset: markerPreset, iconColor: color, iconCaptionMaxWidth: 120 },
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
  public readonly propertyMarkerOptions = { preset: 'islands#redHomeIcon', iconColor: '#dc2626' };
  public readonly connectorOptions = { strokeColor: '#111827', strokeWidth: 2, strokeOpacity: 0.72, strokeStyle: 'shortdash' };
  public readonly walkingPathOptions = { strokeColor: '#111827', strokeWidth: 4, strokeOpacity: 0.9, strokeStyle: 'shortdash' };
  public readonly walkingRouteModel = {
    params: {
      routingMode: 'pedestrian' as const,
      results: 1,
      reverseGeocoding: false,
    },
  };
  public readonly walkingRouteOptions = {
    boundsAutoApply: false,
    preventDragUpdate: true,
    wayPointVisible: false,
    viaPointVisible: false,
    routeActiveMarkerVisible: false,
    routeOpenBalloonOnClick: false,
    routeStrokeColor: '#4b5563',
    routeStrokeWidth: 3,
    routeActiveStrokeColor: '#111827',
    routeActiveStrokeWidth: 4,
    routePedestrianSegmentStrokeColor: '#4b5563',
    routePedestrianSegmentStrokeStyle: 'shortdash',
    routePedestrianSegmentStrokeWidth: 3,
    routeActivePedestrianSegmentStrokeColor: '#111827',
    routeActivePedestrianSegmentStrokeStyle: 'shortdash',
    routeActivePedestrianSegmentStrokeWidth: 4,
  };
  private mapInstance: any;
  private routeRequest?: Subscription;
  private walkingRouteRequest?: Subscription;
  private routeRequestVersion = 0;
  private walkingFallbackRequestVersion: number | null = null;
  private walkingRouteInstance: any;
  private walkingRouteSuccess?: () => void;
  private walkingRouteFailure?: () => void;
  private walkingRouteTimeout?: ReturnType<typeof setTimeout>;
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
    this.detachWalkingRouteListeners();
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

  get mapQueryParams(): Record<string, string | number | null> {
    return {
      announcement: this.announcement?.id ?? null,
      transports: this.activeRoute?.transport.ri ?? null,
    };
  }

  onMapReady(event: { target: any }): void {
    this.mapInstance = event.target;
    if (this.activeRoute) this.fitMapToRoute();
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
    if (this.walkingRouteStatus === 'ready') return `Piyoda yo‘li: ${this.routeDistance(route)}`;
    if (this.walkingRouteStatus === 'loading') return 'Piyoda yo‘li hisoblanmoqda';
    return `Taxminiy masofa: ${this.routeDistance(route)}`;
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
          this.activeRoute = {
            transport,
            style: TRANSPORT_ROUTE_STYLES[transport.type],
            forward,
            backward,
            nearestPoint: proximity.nearestPoint,
            connector: [this.mapCenter, proximity.nearestPoint],
            distanceMeters: proximity.distanceMeters,
          };
          this.walkingRouteStatus = 'loading';
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

  onWalkingRouteReady(event: { target: any }): void {
    this.detachWalkingRouteListeners();
    const walkingRoute = event.target;
    const requestVersion = this.routeRequestVersion;
    this.walkingRouteInstance = walkingRoute;
    this.walkingRouteSuccess = () => this.ngZone.run(() => {
      if (requestVersion !== this.routeRequestVersion || walkingRoute !== this.walkingRouteInstance) return;
      const distance = walkingRoute.getActiveRoute()?.properties.get('distance');
      const distanceMeters = Number(distance?.value);
      if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || !this.activeRoute) {
        this.loadWalkingRouteFallback(requestVersion);
        return;
      }
      this.clearWalkingRouteTimeout();
      this.activeRoute.walkingDistanceMeters = distanceMeters;
      this.walkingRouteStatus = 'ready';
    });
    this.walkingRouteFailure = () => this.ngZone.run(() => {
      if (requestVersion === this.routeRequestVersion && walkingRoute === this.walkingRouteInstance) {
        this.loadWalkingRouteFallback(requestVersion);
      }
    });
    walkingRoute.model.events.add('requestsuccess', this.walkingRouteSuccess);
    walkingRoute.model.events.add('requestfail', this.walkingRouteFailure);
    this.walkingRouteTimeout = setTimeout(() => this.ngZone.run(() => {
      if (requestVersion === this.routeRequestVersion && this.walkingRouteStatus === 'loading') {
        this.loadWalkingRouteFallback(requestVersion);
      }
    }), 12_000);
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
    this.walkingFallbackRequestVersion = null;
    this.detachWalkingRouteListeners();
    this.walkingRouteStatus = 'idle';
  }

  private loadWalkingRouteFallback(requestVersion: number): void {
    if (
      requestVersion !== this.routeRequestVersion
      || this.walkingFallbackRequestVersion === requestVersion
      || !this.mapCenter
      || !this.activeRoute
    ) return;

    const activeRoute = this.activeRoute;
    const points = [this.mapCenter, activeRoute.nearestPoint]
      .map(([latitude, longitude]) => `${longitude},${latitude}`)
      .join(';');
    this.walkingFallbackRequestVersion = requestVersion;
    this.detachWalkingRouteListeners();
    this.walkingRouteStatus = 'loading';

    const request = this.requestService
      .getData<WalkingRouteResponse>(`${environment.urls.GET_WALKING_ROUTE}/${points}`, {
        overview: 'full',
        geometries: 'geojson',
        steps: false,
      })
      .pipe(finalize(() => {
        if (this.walkingFallbackRequestVersion === requestVersion) {
          this.walkingFallbackRequestVersion = null;
          this.walkingRouteRequest = undefined;
        }
      }))
      .subscribe({
        next: (response) => {
          if (requestVersion !== this.routeRequestVersion || this.activeRoute !== activeRoute) return;
          const route = response?.routes?.[0];
          const distanceMeters = Number(route?.distance);
          const walkingPath = this.parseWalkingRoutePath(route?.geometry?.coordinates);
          if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || walkingPath.length < 2) {
            this.walkingRouteStatus = 'fallback';
            return;
          }
          activeRoute.walkingDistanceMeters = distanceMeters;
          activeRoute.walkingPath = walkingPath;
          this.walkingRouteStatus = 'ready';
        },
        error: () => {
          if (requestVersion === this.routeRequestVersion && this.activeRoute === activeRoute) {
            this.walkingRouteStatus = 'fallback';
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

  private detachWalkingRouteListeners(): void {
    this.clearWalkingRouteTimeout();
    const events = this.walkingRouteInstance?.model?.events;
    if (events && this.walkingRouteSuccess) events.remove('requestsuccess', this.walkingRouteSuccess);
    if (events && this.walkingRouteFailure) events.remove('requestfail', this.walkingRouteFailure);
    this.walkingRouteInstance = undefined;
    this.walkingRouteSuccess = undefined;
    this.walkingRouteFailure = undefined;
  }

  private clearWalkingRouteTimeout(): void {
    if (this.walkingRouteTimeout) clearTimeout(this.walkingRouteTimeout);
    this.walkingRouteTimeout = undefined;
  }

  private fitMapToRoute(): void {
    if (!this.activeRoute || !this.mapCenter || !this.mapInstance) return;
    const coordinates = [this.mapCenter, ...this.activeRoute.forward, ...this.activeRoute.backward];
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
