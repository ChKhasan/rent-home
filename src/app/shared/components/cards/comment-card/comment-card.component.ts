import {Component, Input} from '@angular/core';
import {CommentResponse} from "../../../../core/interfaces/common.interface";
import {DatePipe, NgForOf} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {FieldsetModule} from "primeng/fieldset";
import {SharedModule} from "primeng/api";

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [
    DatePipe,
    AvatarModule,
    FieldsetModule,
    NgForOf,
    SharedModule
  ],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.css'
})
export class CommentCardComponent {
 @Input() comment!: CommentResponse;
 public dateFormat: string = 'dd.MM.YYYY'
}
