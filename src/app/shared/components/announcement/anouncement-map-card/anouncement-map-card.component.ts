import { Component, Input, OnInit } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { IAnnouncementInfo } from '@services/interfaces';
import { PriceBlockComponent } from '../price-block/price-block.component';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-anouncement-map-card',
  standalone: true,
  imports: [TagModule, PriceBlockComponent, GalleriaModule],
  templateUrl: './anouncement-map-card.component.html',
  styleUrl: './anouncement-map-card.component.css',
})
export class AnouncementMapCardComponent implements OnInit {
  @Input() announcement!: IAnnouncementInfo;
  @Input() close: Function | undefined;
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

  closeBottomSheet() {
    if (this.close !== undefined) this.close();
  }
  ngOnInit() {}
}
