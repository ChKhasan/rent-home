import { Component, DestroyRef, HostListener, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { CustomDropDownAnimation } from '@animations';
import { Event, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  animations: [CustomDropDownAnimation],
})
export class DropdownComponent {
  public profileDrop: Boolean = false;
  @Input() dropName: string = 'dropdown';
  constructor(public router: Router, private destroyRef: DestroyRef) {}
  ngOnInit() {
    this.router.events.pipe(filter((event: Event) => event instanceof NavigationStart), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.profileDrop = false;
    });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.' + this.dropName)) {
      this.profileDrop = false;
    }
  }
}
