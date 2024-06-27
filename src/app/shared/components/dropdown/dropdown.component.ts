import {Component, HostListener, Input} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";
import {CustomDropDownAnimation} from "@animations";
import {Event, NavigationStart, Router} from "@angular/router";

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  animations: [CustomDropDownAnimation]
})
export class DropdownComponent {
  public profileDrop: Boolean = false;
  @Input() dropName: string = 'dropdown';
  constructor(
    public router: Router,
  ) {
  }
  ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.profileDrop = false
      }
    });}
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.' + this.dropName)) {
      this.profileDrop = false;
    }
  }
}
