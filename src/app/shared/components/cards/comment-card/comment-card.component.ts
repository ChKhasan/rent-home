import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ICommentInfo } from '@services/interfaces';
import { DatePipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { FieldsetModule } from 'primeng/fieldset';
import { SharedModule } from 'primeng/api';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [DatePipe, AvatarModule, FieldsetModule, SharedModule],
  templateUrl: './comment-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './comment-card.component.css',
})
export class CommentCardComponent {
  @Input() comment = {
    comment: '',
    user: {},
  } as unknown as ICommentInfo;
  public dateFormat: string = 'dd.MM.YYYY';
}
