import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { LucideX } from '@lucide/angular';

let bottomSheetId = 0;

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [LucideX],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BottomSheetComponent implements OnDestroy {
  @Input() title = 'Filtrlar';
  @Input() closeLabel = 'Filtrni yopish';
  @ViewChild('sheet') private sheet?: ElementRef<HTMLElement>;
  readonly titleId = `bottom-sheet-title-${++bottomSheetId}`;
  bottomSheetVisible = false;
  private previouslyFocused: HTMLElement | null = null;

  open() {
    if (this.bottomSheetVisible) return;
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.bottomSheetVisible = true;
    document.body.classList.add('no-scroll');
    history.pushState({ ...history.state, nexthomeBottomSheet: true }, '', location.href);
    setTimeout(() => this.focusFirstControl());
  }

  close() {
    if (!this.bottomSheetVisible) return;
    this.hide();
    if (history.state?.nexthomeBottomSheet) history.back();
  }

  private hide() {
    this.bottomSheetVisible = false;
    document.body.classList.remove('no-scroll');
    setTimeout(() => this.previouslyFocused?.focus());
  }

  private focusFirstControl(): void {
    this.sheet?.nativeElement
      .querySelector<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.bottomSheetVisible) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || !this.sheet) return;

    const controls = Array.from(this.sheet.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.getClientRects().length > 0);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('window:popstate')
  handlePopState(): void {
    if (this.bottomSheetVisible) this.hide();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') document.body.classList.remove('no-scroll');
  }
}
