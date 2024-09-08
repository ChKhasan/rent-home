import { Component, Input } from '@angular/core';
import { ValidationErrorAnimation } from '@animations';

@Component({
  selector: 'app-invaid-text',
  standalone: true,
  imports: [],
  animations: [ValidationErrorAnimation],
  templateUrl: './invaid-text.component.html',
  styleUrl: './invaid-text.component.css',
})
export class InvaidTextComponent {
  @Input() text!: string;
}
