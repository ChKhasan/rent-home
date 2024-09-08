import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IcommentList, UserImages } from '@services/interfaces';
import { CommentsService } from '@services/comments';
import { ActivatedRoute } from '@angular/router';
import { QueryService } from '@services/query';
import { WebSocketService } from '@services/webSocket';
import { AuthService } from '@services/auth';
import { environment } from '@environments';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { RegisterDialogComponent } from '../../modals/register-dialog/register-dialog.component';

@Component({
  selector: 'app-comment-block',
  standalone: true,
  imports: [ButtonModule, NgForOf, FormsModule, NgIf, DatePipe, AuthDialogComponent, RegisterDialogComponent],
  templateUrl: './comment-block.component.html',
  styleUrl: './comment-block.component.css',
})
export class CommentBlockComponent implements OnInit, OnDestroy {
  @ViewChild(RegisterDialogComponent)
  registerDialogComponent!: RegisterDialogComponent;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;

  public comments: IcommentList = [];
  public pendingComments: any = [];
  private id: any;
  public loading: boolean = false;
  public message: string = '';
  public dateFormat: string = 'dd.MM.YYYY';
  public url: string = '';
  constructor(
    private commentsService: CommentsService,
    private route: ActivatedRoute,
    private queryService: QueryService,
    private webSocketService: WebSocketService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      Promise.resolve().then(() => this.__GET_COMMETS());
      this.webSocketConnection();
    }
  }
  webSocketConnection = () => {
    this.id = this.route.snapshot.paramMap.get('id');
    this.url = `/announcement/${this.id}/`;
    this.webSocketService.connect(`wss://new.rent-home.uz/ws/announcement/${this.id}/`);
    this.webSocketService.onMessage().subscribe((message) => {
      this.loading = false;
      if (message.message && message.message !== '401') {
        let comment = {
          ...message.message,
          user: {
            ...message.message.user,
            images: message.message.user.images.map((elem: UserImages) => {
              return {
                ...elem,
                image: environment.baseUrl + elem.image,
              };
            }),
          },
        };
        this.pendingComments = [];
        this.comments.unshift(comment);
      }
    });
  };
  sendMessage(): void {
    if (this.authService.auth && this.authService.user.id) {
      this.loading = true;
      this.pendingComments.push({
        announcement: this.id,
        comment: this.message,
        created: `${new Date()}`,
        user: this.authService.user,
        pending: true,
      });
      this.webSocketService.send({ text: this.message });
      this.message = '';
    } else {
      this.openAuthDialog();
    }
  }
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect WebSocket when component is destroyed
  }
  __GET_COMMETS = () => {
    this.commentsService.get(this.commentParams()).subscribe((response: IcommentList) => {
      this.comments = response.reverse();
    });
  };
  get commentLength() {
    return this.comments.length;
  }
  commentParams() {
    let params = {
      announcement_id: Number(this.route.snapshot.paramMap.get('id')),
    };
    return this.queryService.generatorHttpParams(params);
  }
}
