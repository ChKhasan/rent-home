import { Component } from '@angular/core';
import {ButtonModule} from "primeng/button";
import {CommentResponse} from "../../../../core/interfaces/common.interface";
import {CommentsService} from "../../../../core/services/comments/comments.service";
import {ActivatedRoute} from "@angular/router";
import {QueryService} from "../../../../core/services/query/query.service";
import {WebSocketService} from "../../../../core/services/webSocket/web-socket.service";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {environment} from "../../../../../environments/environment";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-comment-block',
  standalone: true,
  imports: [
    ButtonModule,
    NgForOf,
    FormsModule,
    NgIf,
    DatePipe
  ],
  templateUrl: './comment-block.component.html',
  styleUrl: './comment-block.component.css'
})
export class CommentBlockComponent {
  public comments: CommentResponse[] = [];
  private id: any;
  public loading: boolean = false;
  public message: string = '';
  public dateFormat: string = 'dd.MM.YYYY'
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
      this.webSocketConnection()
      window.scrollTo(0, 0);
      this.__GET_COMMETS();
    }
  }
  webSocketConnection() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.webSocketService.connect(`wss://api.rent-home.uz/ws/announcement/${this.id}/`);
    this.webSocketService.onMessage().subscribe((message) => {
      this.loading = false
      if(message.message && message.message !== '401')
        this.comments.unshift(message.message)
    });
  }
  sendMessage(): void {
    this.loading = true;
    this.webSocketService.send({ text: this.message });
    this.message = ''
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect WebSocket when component is destroyed
  }
  __GET_COMMETS = () => {
    this.commentsService.get(this.commentParams()).subscribe((response: CommentResponse[]) => {
      this.comments = response.reverse();
    })
  }
  commentParams() {
    let params = {
      announcement_id: Number(this.route.snapshot.paramMap.get('id'))
    }
    return this.queryService.generatorHttpParams(params)
  }
}
