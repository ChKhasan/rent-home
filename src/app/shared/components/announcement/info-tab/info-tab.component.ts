import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
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
    CommentBlockComponent
  ],
  templateUrl: './info-tab.component.html',
  styleUrl: './info-tab.component.css'
})
export class InfoTabComponent implements OnInit,OnDestroy {
  public tabHandle = 1;
  public zoom = 10;
  public coords = [0, 0];
  public loading = false;
  public comments: CommentResponse[] = [];
  private id: any
  @ViewChild(CommentDialogComponent) commentDialogComponent!: CommentDialogComponent
  @Input() announcement: any;

  constructor(
    private commentsService: CommentsService,
    private route: ActivatedRoute,
    private queryService: QueryService,
    private webSocketService: WebSocketService,
    public authService: AuthService
  ) {

  }

  ngOnInit(): void {

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      this.__GET_COMMETS();
    }
  }
  webSocketConnection() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.webSocketService.connect(`${environment.baseUrl}/ws/announcement/${this.id}/`);
    this.webSocketService.onMessage().subscribe((message) => {
      console.log(message)
      if(message.message && message.message !== '401')
        this.comments.push(message.message)
    });
  }
  sendMessage(): void {
    this.webSocketService.send({ text: 'Socket test 12' });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect WebSocket when component is destroyed
  }
  __GET_COMMETS = () => {
    this.commentsService.get(this.commentParams()).subscribe((response: CommentResponse[]) => {
      this.comments = response;
    })
  }

  commentParams() {
    let params = {
    announcement_id: Number(this.route.snapshot.paramMap.get('id'))
    }
    return this.queryService.generatorHttpParams(params)
  }

  openCommentDialog() {
    this.commentDialogComponent.showDialog()
  }

}
