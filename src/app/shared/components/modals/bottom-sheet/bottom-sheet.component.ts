import { Component } from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css',
  animations: [
    trigger('slideBottom', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class BottomSheetComponent {
  bottomSheetVisible = false;
  open() {
    this.bottomSheetVisible = true;
    document.body.classList.add('no-scroll');
  }
  close() {
    this.bottomSheetVisible = false;
    document.body.classList.remove('no-scroll');
  }
}
