import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {AngularYandexMapsModule} from "angular8-yandex-maps";
import {CommentDialogComponent} from "../../modals/comment-dialog/comment-dialog.component";
import {CommentsService} from "../../../../core/services/comments/comments.service";
import {CommentCardComponent} from "../../cards/comment-card/comment-card.component";
import {ActivatedRoute} from "@angular/router";
import {HttpParams} from "@angular/common/http";
import {QueryService} from "../../../../core/services/query/query.service";
import {CommentResponse} from "../../../../core/interfaces/common.interface";

@Component({
  selector: 'app-info-tab',
  standalone: true,
  imports: [
    NgIf,
    AngularYandexMapsModule,
    CommentDialogComponent,
    CommentCardComponent,
    NgForOf
  ],
  templateUrl: './info-tab.component.html',
  styleUrl: './info-tab.component.css'
})
export class InfoTabComponent implements OnInit {
  public tabHandle = 1;
  public zoom = 10;
  public coords = [0, 0];
  public loading = false;
  public comments: CommentResponse[] = [];
  @ViewChild(CommentDialogComponent) commentDialogComponent!: CommentDialogComponent
  @Input() announcement: any;

  constructor(
    private commentsService: CommentsService,
    private route: ActivatedRoute,
    private queryService: QueryService
  ) {

  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      this.__GET_COMMETS()
    }
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
