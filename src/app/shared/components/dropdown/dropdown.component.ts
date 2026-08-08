import { Component, DestroyRef, HostListener, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Event, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
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
