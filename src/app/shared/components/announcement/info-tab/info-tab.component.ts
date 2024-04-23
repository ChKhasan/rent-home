import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {AngularYandexMapsModule} from "angular8-yandex-maps";
import {CommentDialogComponent} from "../../modals/comment-dialog/comment-dialog.component";
import {CommentsService} from "../../../../core/services/comments/comments.service";
import {CommentCardComponent} from "../../cards/comment-card/comment-card.component";
import {ActivatedRoute} from "@angular/router";
import {QueryService} from "../../../../core/services/query/query.service";
import {CommentResponse} from "../../../../core/interfaces/common.interface";
import {WebSocketService} from "../../../../core/services/webSocket/web-socket.service";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {FieldsetModule} from "primeng/fieldset";
import {AvatarModule} from "primeng/avatar";
import {environment} from "../../../../../environments/environment";
import {CommentBlockComponent} from "../comment-block/comment-block.component";

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
    NgClass
  ],
  templateUrl: './info-tab.component.html',
  styleUrl: './info-tab.component.css'
})
export class InfoTabComponent {
  public tabHandle = 1;
  public zoom = 10;
  public coords = [0, 0];
  public loading = false;
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
