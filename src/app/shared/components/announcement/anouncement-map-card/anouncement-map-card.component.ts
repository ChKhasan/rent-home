import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { IAnnouncementInfo } from '@services/interfaces';
import { PriceBlockComponent } from '../price-block/price-block.component';
import { GalleriaModule } from 'primeng/galleria';
import { PublisherMetaComponent } from '../publisher-meta/publisher-meta.component';


@Component({
  selector: 'app-anouncement-map-card',
  standalone: true,
  imports: [TagModule, PriceBlockComponent, GalleriaModule, PublisherMetaComponent],
  templateUrl: './anouncement-map-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './anouncement-map-card.component.css',
})
export class AnouncementMapCardComponent implements OnInit {
  @Input() announcement = { images: [] } as unknown as IAnnouncementInfo;
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
