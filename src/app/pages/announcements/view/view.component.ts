import { Component } from '@angular/core';
import { ViewPageComponent } from '../../../shared/components/announcement/view-page/view-page.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [ViewPageComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
})
export class ViewComponent {

}
