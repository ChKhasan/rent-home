import {Component, Input} from '@angular/core';
import {ValidationErrorAnimation} from "../../../../core/common/animations";

@Component({
  selector: 'app-invaid-text',
  standalone: true,
  imports: [],
  animations: [ValidationErrorAnimation],
  templateUrl: './invaid-text.component.html',
  styleUrl: './invaid-text.component.css'
})
export class InvaidTextComponent {
  @Input() text!: string;
}
