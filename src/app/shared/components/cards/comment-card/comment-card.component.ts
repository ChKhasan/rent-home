import { Component, Input } from '@angular/core';
import { ICommentInfo } from '@services/interfaces';
import { DatePipe, NgForOf } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { FieldsetModule } from 'primeng/fieldset';
import { SharedModule } from 'primeng/api';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [DatePipe, AvatarModule, FieldsetModule, NgForOf, SharedModule],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.css',
})
export class CommentCardComponent {
  @Input() comment!: ICommentInfo;
  public dateFormat: string = 'dd.MM.YYYY';
}
