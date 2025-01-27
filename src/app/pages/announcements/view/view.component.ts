import { Component } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { SkeletonModule } from 'primeng/skeleton';
import { StyleClassModule } from 'primeng/styleclass';
import { ViewPageComponent } from '../../../shared/components/announcement/view-page/view-page.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [GalleriaModule, TagModule, ButtonModule, SkeletonModule, StyleClassModule, ViewPageComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
  animations: [trigger('fadeAnimation', [transition('void => *', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]), transition('* => void', [animate('300ms', style({ opacity: 0 }))])])],
})
export class ViewComponent {

}
