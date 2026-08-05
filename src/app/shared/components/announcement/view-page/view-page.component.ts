import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { animate, style, transition, trigger } from '@angular/animations';
import { PriceBlockComponent } from '@components/announcement/price-block/price-block.component';
import { IAnnouncementInfo, IAgencyInfo } from '@services/interfaces';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { PropertyGalleryComponent } from '@components/announcement/property-gallery/property-gallery.component';
import { AboutComponent } from '@components/announcement/about/about.component';
import { UserCardComponent } from '@/shared/components/announcement/user-card/user-card.component';
import { catchError, finalize, throwError } from 'rxjs';
import { ListingRailComponent } from '../listing-rail/listing-rail.component';
import { AuthService } from '@/core/services/auth/auth.service';
import { AnnouncementsCardComponent } from "../../cards/announcements-card/announcements-card.component";
import { PublisherMetaComponent } from '../publisher-meta/publisher-meta.component';
import { ToastService } from '@services/toast';
import { AuthPromptService } from '@/core/services/auth-prompt/auth-prompt.service';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { PricePipe } from '@/shared/pipes/price/price.pipe';

type ModeratedAnnouncement = IAnnouncementInfo & {
  moderation_status?: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string | null;
  agency?: IAgencyInfo | null;
};

@Component({
  selector: 'app-view-page',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterLink, ButtonModule, DialogModule, TextareaModule, PriceBlockComponent, SkeletonModule, PropertyGalleryComponent, AboutComponent, UserCardComponent, ListingRailComponent, AnnouncementsCardComponent, PublisherMetaComponent, PricePipe],
  templateUrl: './view-page.component.html',
  styleUrl: './view-page.component.css',
  animations: [trigger('fadeAnimation', [transition('void => *', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]), transition('* => void', [animate('300ms', style({ opacity: 0 }))])])],
})
export class ViewPageComponent implements OnInit {
  loading: boolean = true;
  displayBasic: boolean = false;
  activeIndex = 0;
  rec_announcements: any[] = [];
  reportDialog = false;
  reportSuccess = false;
  reportDetails = '';
  reporting = false;
  @Input() profile: boolean = false;
  public announcement: ModeratedAnnouncement = {
    id: 0,
    transports: [],
    images: [],
    lessee_types: [],
    title: '',
    partnership: false,
    need_people_count: 0,
    room_count: 0,
    address: '',
    location_x: '0',
    location_y: '0',
    currency: 'USD',
    total_price: 0,
    price_for_one: 0,
    appartment_status: 0,
    description: '',
    conditioner: false,
    washing_machine: false,
    fridge: false,
    floor: null,
    area: null,
    user: 0,
    region: null,
    moderation_status: undefined,
    moderation_comment: undefined,
    agency: null,
  };
  private id: string | null = '';
  images!: any[];

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private authService: AuthService,
    private authPromptService: AuthPromptService,
    private chatUrlService: ChatUrlService,
    private toastService: ToastService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  get contactUserId(): number | undefined {
    const user = this.announcement?.user as any;
    return this.announcement?.publisher?.responsible_person?.user_id
      || (typeof user === 'number' ? user : user?.id);
  }

  get contactPhone(): string | null {
    const user = this.announcement?.user as any;
    return this.announcement?.publisher?.phone || user?.phone_number || null;
  }

  get isOwnListing(): boolean {
    return !!this.authService.user?.id && this.authService.user.id === this.contactUserId;
  }

  get displayPrice(): number {
    const price = this.announcement.partnership && this.announcement.price_for_one
      ? this.announcement.price_for_one
      : this.announcement.total_price;
    return Number(price || 0);
  }

  get moderationLabel(): string {
    if (this.announcement.moderation_status === 'approved') return 'Tasdiqlangan';
    if (this.announcement.moderation_status === 'rejected') return 'Bekor qilingan';
    return 'Moderatsiyada';
  }

  openReport(): void {
    if (this.profile || this.isOwnListing) return;
    if (!this.authService.auth) {
      this.authPromptService.open(this.router.url);
      return;
    }
    this.reportDetails = '';
    this.reportSuccess = false;
    this.reportDialog = true;
  }

  toChat(): void {
    if (!this.contactUserId || this.isOwnListing) return;
    if (!this.authService.auth) {
      this.authPromptService.open(this.router.url);
      return;
    }
    const user = this.announcement.user as any;
    const avatar = this.announcement.publisher?.agency?.logo || user?.images?.[0]?.image;
    this.chatUrlService.save(this.announcement.id, {
      id: this.contactUserId,
      name: this.announcement.publisher?.display_name || user?.name || "E'lon beruvchi",
      phone_number: this.contactPhone,
      images: avatar ? [{ image: avatar }] : [],
      is_online: user?.is_online,
      last_online: user?.last_online,
    });
    void this.router.navigate(['/profile/chat'], { queryParams: { userId: this.contactUserId } });
  }

  submitReport(): void {
    if (this.reporting || this.reportDetails.trim().length < 10 || !this.announcement.id) return;
    this.reporting = true;
    this.requestService.requestData('/api/content-reports/', 'POST', {
      target_type: 'announcement',
      category: 'hidden_broker',
      details: this.reportDetails.trim(),
      announcement: this.announcement.id,
    }).pipe(finalize(() => (this.reporting = false))).subscribe({
      next: () => (this.reportSuccess = true),
      error: () => this.toastService.showMessage('error', 'Xatolik', "Shikoyatni yuborib bo'lmadi"),
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const headers: any = {};
      let accessToken = localStorage.getItem(environment.accessToken);
      if (accessToken || this.authService.auth || this.authService.user?.id) headers.Authorization = 'Bearer' + ' ' + accessToken;
      this.__GET_ANNOUNCEMENTS(headers);
      if(!this.profile)
      this.__GET__REC_ANNOUNCEMENTS(headers);
    }
  }
  goBack(): void {
    window.history.back();
  }
  afterSendFilter = () => {};

  public skeletonList = [1, 2, 3, 4, 5, 6];

  __GET_ANNOUNCEMENTS = (headers: any = {}) => {
    this.requestService.getData<ModeratedAnnouncement>(
      (this.profile ? environment.authUrls.GET_MY_ANNONCEMENTS : environment.urls.GET_ANNONCEMENTS) + this.id + '/',
      {},
      { ...headers }
    ).subscribe((response: ModeratedAnnouncement) => {
      this.announcement = response;
      this.images = response.images;
      this.loading = false;
    });
  };
  __GET__REC_ANNOUNCEMENTS = (headers: any = {}) => {
    this.loading = true;
    this.requestService
      .getData(environment.urls.GET_RECOMMENDATION_VIEW + this.id + '/', {}, { ...headers })
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          console.log('Error while fetching recommendations:', error);
          return throwError(() => error);
        })
      )
      .subscribe((response: any) => (this.rec_announcements = response.slice(0,2)));
  };
}
