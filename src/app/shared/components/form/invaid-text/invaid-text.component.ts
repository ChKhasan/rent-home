import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-invaid-text',
  standalone: true,
  imports: [],
  templateUrl: './invaid-text.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invaid-text.component.css',
})
export class InvaidTextComponent {
  @Input() text!: string;
}
