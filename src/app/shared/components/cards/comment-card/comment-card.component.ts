import {Component, Input} from '@angular/core';
import {CommentResponse} from "../../../../core/interfaces/common.interface";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.css'
})
export class CommentCardComponent {
 @Input() comment: CommentResponse | undefined;
 public dateFormat: string = 'dd.MM.YYYY'
}
