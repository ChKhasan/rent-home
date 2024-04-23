import {Component, OnInit} from '@angular/core';
import {AnnouncementsService} from "../../../core/services/announcements/announcements.service";
import {ActivatedRoute, Router} from "@angular/router";
import {GalleriaModule} from "primeng/galleria";
import {TagModule} from "primeng/tag";
import {InfoTabComponent} from "../../../shared/components/announcement/info-tab/info-tab.component";
import {SearchComponent} from "../../../shared/components/announcement/search/search.component";

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    GalleriaModule,
    TagModule,
    InfoTabComponent,
    SearchComponent
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent implements OnInit {
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
}
