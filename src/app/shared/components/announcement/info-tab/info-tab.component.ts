import {Component, Input, ViewChild} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {AngularYandexMapsModule} from "angular8-yandex-maps";
import {CommentDialogComponent} from "../../modals/comment-dialog/comment-dialog.component";
import {CommentCardComponent} from "../../cards/comment-card/comment-card.component";
import {AuthService} from "@services/auth";
import {FieldsetModule} from "primeng/fieldset";
import {AvatarModule} from "primeng/avatar";
import {CommentBlockComponent} from "../comment-block/comment-block.component";
import {SkeletonModule} from "primeng/skeleton";

@Component({
  selector: 'app-info-tab',
  standalone: true,
    imports: [
        NgIf,
        AngularYandexMapsModule,
        CommentDialogComponent,
        CommentCardComponent,
        NgForOf,
        FieldsetModule,
        AvatarModule,
        DatePipe,
        CommentBlockComponent,
        NgClass,
        SkeletonModule
    ],
  templateUrl: './info-tab.component.html',
  styleUrl: './info-tab.component.css'
})
export class InfoTabComponent {
  public tabHandle = 1;
  public zoom = 10;
  public coords = [0, 0];
  @Input() loading: boolean = true;
  @ViewChild(CommentDialogComponent) commentDialogComponent!: CommentDialogComponent
  @ViewChild(CommentBlockComponent) commentBlockComponent!: CommentBlockComponent
  @Input() announcement: any;

  constructor(
    public authService: AuthService
  ) {

  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }
}
