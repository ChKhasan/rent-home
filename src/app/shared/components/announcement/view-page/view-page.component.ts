import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { PriceBlockComponent } from '@components/announcement/price-block/price-block.component';
import { IAnnouncementInfo, IAgencyInfo } from '@services/interfaces';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { PropertyGalleryComponent } from '@components/announcement/property-gallery/property-gallery.component';
import { AboutComponent } from '@components/announcement/about/about.component';
import { UserCardComponent } from '@/shared/components/announcement/user-card/user-card.component';
import { finalize, Subscription } from 'rxjs';
import { ListingRailComponent } from '../listing-rail/listing-rail.component';
import { AuthService } from '@/core/services/auth/auth.service';
import { AnnouncementsCardComponent } from "../../cards/announcements-card/announcements-card.component";
import { ToastService } from '@services/toast';
import { AuthPromptService } from '@/core/services/auth-prompt/auth-prompt.service';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { PricePipe } from '@/shared/pipes/price/price.pipe';
import { LikesService } from '@services/likes';
import {
  LucideArrowLeft,
  LucideBadgeCheck,
  LucideFlag,
  LucideHeart,
  LucideLoaderCircle,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucideShare2,
} from '@lucide/angular';

type ModeratedAnnouncement = IAnnouncementInfo & {
  deal_type?: 'RENT' | 'SALE';
  moderation_status?: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string | null;
  agency?: IAgencyInfo | null;
};

type ContentReportCategory = 'fraud' | 'inappropriate' | 'spam' | 'harassment' | 'hidden_broker' | 'other';

@Component({
  selector: 'app-view-page',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, RouterLink, ButtonModule, DialogModule, TextareaModule, PriceBlockComponent, SkeletonModule, PropertyGalleryComponent, AboutComponent, UserCardComponent, ListingRailComponent, AnnouncementsCardComponent, PricePipe, LucideArrowLeft, LucideBadgeCheck, LucideFlag, LucideHeart, LucideLoaderCircle, LucideMapPin, LucideMessageCircle, LucidePhone, LucideShare2],
  templateUrl: './view-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './view-page.component.css',
})
export class ViewPageComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  detailError = false;
  recommendationsLoading = false;
  recommendationsError = false;
  favoriteLoading = false;
  rec_announcements: any[] = [];
  reportDialog = false;
  reportSuccess = false;
  reportDetails = '';
  reportCategory: ContentReportCategory = 'other';
  reporting = false;
  readonly reportCategories: Array<{ value: ContentReportCategory; label: string }> = [
    { value: 'fraud', label: 'Firibgarlik yoki yolg‘on ma’lumot' },
    { value: 'inappropriate', label: 'Nomaqbul kontent' },
    { value: 'spam', label: 'Spam yoki takroriy e’lon' },
    { value: 'harassment', label: 'Haqorat yoki bosim' },
    { value: 'hidden_broker', label: 'Makler sifatida yashirilgan' },
    { value: 'other', label: 'Boshqa' },
  ];
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
  private routeParamsSubscription?: Subscription;
  private detailRequest?: Subscription;
  private recommendationsRequest?: Subscription;
  images!: any[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private authService: AuthService,
    private authPromptService: AuthPromptService,
    private chatUrlService: ChatUrlService,
    private toastService: ToastService,
    public likesService: LikesService,
  ) {}

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

  get dealTypeLabel(): string {
    return this.announcement.deal_type === 'SALE' ? 'Sotuv' : 'Ijara';
  }

  get priceContextLabel(): string {
    if (this.announcement.deal_type === 'SALE') return 'umumiy narx';
    if (this.announcement.partnership && this.announcement.price_for_one) return 'bir kishi uchun / oyiga';
    return 'oyiga';
  }

  get totalPriceSupportingLabel(): string | null {
    if (!this.announcement.partnership || !this.announcement.price_for_one || !this.announcement.total_price) return null;
    return `Jami ${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(Number(this.announcement.total_price))} ${this.announcement.currency} oyiga`;
  }

  get commissionValueLabel(): string {
    return this.announcement.commission?.label?.replace('Komissiya ', '') || '';
  }

  get listingDateLabel(): string {
    const created = (this.announcement as any)?.created;
    if (!created) return '';
    const date = new Date(created);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  get isLiked(): boolean {
    return this.likesService.likes.some((id: unknown) => Number(id) === Number(this.announcement.id));
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
    this.reportCategory = 'other';
    this.reportDetails = '';
    this.reportSuccess = false;
    this.reportDialog = true;
  }

  toggleFavorite(): void {
    if (!this.announcement.id || this.favoriteLoading) return;
    if (!this.authService.auth) {
      this.likesService.likeHandle(this.announcement.id);
      this.toastService.showMessage(
        'success',
        this.isLiked ? 'E’lon saqlandi' : 'Saqlanganlardan olib tashlandi',
        this.isLiked ? 'E’lon saqlanganlar ro‘yxatiga qo‘shildi.' : 'E’lon saqlanganlar ro‘yxatidan olib tashlandi.',
      );
      return;
    }

    this.favoriteLoading = true;
    const request = this.isLiked
      ? this.likesService.delete({ id: this.announcement.id })
      : this.likesService.post({ announcement: this.announcement.id });
    request.pipe(finalize(() => this.refreshLikes())).subscribe({
      error: () => this.toastService.showMessage('error', 'Xatolik', "E'lonni saqlab bo'lmadi."),
    });
  }

  async shareListing(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const shareData = {
      title: this.announcement.title,
      text: `${this.announcement.title} - ${this.displayPrice} ${this.announcement.currency}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      this.toastService.showMessage('success', 'Havola nusxalandi', "E'lon havolasi almashish buferiga nusxalandi.");
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        this.toastService.showMessage('error', 'Xatolik', 'Havolani ulashib bo‘lmadi.');
      }
    }
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
      category: this.reportCategory,
      details: this.reportDetails.trim(),
      announcement: this.announcement.id,
    }).pipe(finalize(() => (this.reporting = false))).subscribe({
      next: () => (this.reportSuccess = true),
      error: (error) => {
        const message = error?.error?.announcement?.[0]
          || error?.error?.details?.[0]
          || error?.error?.detail
          || "Shikoyatni yuborib bo'lmadi";
        this.toastService.showMessage('error', 'Xatolik', message);
      },
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.routeParamsSubscription = this.route.paramMap.subscribe((params) => {
        this.id = params.get('id');
        this.loadListing();
      });
      if (this.authService.auth) this.refreshLikes();
      else this.likesService.reloadLikes();
    }
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription?.unsubscribe();
    this.detailRequest?.unsubscribe();
    this.recommendationsRequest?.unsubscribe();
  }
  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    void this.router.navigate(['/announcements']);
  }

  retryDetails(): void {
    if (this.loading) return;
    this.loading = true;
    this.detailError = false;
    this.__GET_ANNOUNCEMENTS(this.authHeaders());
  }

  retryRecommendations(): void {
    if (this.recommendationsLoading) return;
    this.__GET__REC_ANNOUNCEMENTS(this.authHeaders());
  }

  __GET_ANNOUNCEMENTS = (headers: any = {}) => {
    this.detailRequest?.unsubscribe();
    this.detailRequest = this.requestService.getData<ModeratedAnnouncement>(
      (this.profile ? environment.authUrls.GET_MY_ANNONCEMENTS : environment.urls.GET_ANNONCEMENTS) + this.id + '/',
      {},
      { ...headers }
    ).subscribe({
      next: (response: ModeratedAnnouncement) => {
        this.announcement = response;
        this.images = response.images;
        this.loading = false;
        this.detailError = false;
      },
      error: () => {
        this.loading = false;
        this.detailError = true;
      },
    });
  };
  __GET__REC_ANNOUNCEMENTS = (headers: any = {}) => {
    if (!this.id) return;
    this.recommendationsRequest?.unsubscribe();
    this.recommendationsLoading = true;
    this.recommendationsError = false;
    this.rec_announcements = [];
    this.recommendationsRequest = this.requestService
      .getData(environment.urls.GET_RECOMMENDATION_VIEW + this.id + '/', {}, { ...headers })
      .pipe(finalize(() => (this.recommendationsLoading = false)))
      .subscribe({
        next: (response: any) => {
          const items = Array.isArray(response) ? response : response?.results || [];
          this.rec_announcements = items
            .filter((item: any) => Number(item?.id) !== Number(this.id))
            .slice(0, 6);
        },
        error: () => (this.recommendationsError = true),
      });
  };

  private loadListing(): void {
    if (!this.id) {
      this.loading = false;
      this.detailError = true;
      return;
    }
    const headers = this.authHeaders();
    this.loading = true;
    this.detailError = false;
    this.__GET_ANNOUNCEMENTS(headers);
    if (!this.profile) this.__GET__REC_ANNOUNCEMENTS(headers);
  }

  private refreshLikes(): void {
    this.likesService.get().pipe(finalize(() => (this.favoriteLoading = false))).subscribe({
      next: (response) => {
        const ids = response.map((item: any) => item.announcement?.id);
        this.likesService.handleUserLikes(ids);
      },
      error: () => (this.favoriteLoading = false),
    });
  }

  private authHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const accessToken = localStorage.getItem(environment.accessToken);
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }
}
