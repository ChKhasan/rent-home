import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css',
})
export class CounterComponent {
  public summ: number = 0;
  public counter: number = 0;
  summer(a: number, b: number) {
    this.summ = a + b;
  }
  increment() {
    this.counter++;
  }
}
