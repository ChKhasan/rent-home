import {Component, OnInit} from '@angular/core';
import {AnnouncementsService} from "../../../core/services/announcements/announcements.service";
import {ActivatedRoute, Router} from "@angular/router";
import {GalleriaModule} from "primeng/galleria";
import {TagModule} from "primeng/tag";
import {InfoTabComponent} from "../../../shared/components/announcement/info-tab/info-tab.component";
import {SearchComponent} from "../../../shared/components/announcement/search/search.component";
import {ButtonModule} from "primeng/button";
import {animate, style, transition, trigger} from "@angular/animations";
import {PriceBlockComponent} from "../../../shared/components/announcement/price-block/price-block.component";

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    GalleriaModule,
    TagModule,
    InfoTabComponent,
    SearchComponent,
    ButtonModule,
    PriceBlockComponent
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ViewComponent implements OnInit {
  displayBasic: boolean = false;
  activeIndex = 0;
  public announcement = {
    title: undefined,
    appartment_status: undefined,
    address: undefined,
    description: undefined,
    conditioner: false,
    washing_machine: false
  };
  private id: string | null = '';
  images!: any[];

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  constructor(
    private announcementService: AnnouncementsService,
    private route: ActivatedRoute,
    ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.announcementService.getById(this.id).subscribe((response) => {
      this.announcement = response
      this.images = response.images
    })
  }
  goBack(): void {
    window.history.back(); // Navigates back one step in the history
  }
  afterSendFilter = () => {

  }
}
