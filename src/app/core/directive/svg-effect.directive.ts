import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSvgEffect]',
  standalone: true, // No need to declare in an NgModule
})
export class SvgEffectDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const parent = this.el.nativeElement;
    const paths = parent.querySelectorAll('.animate-item');

    if (!parent) return;

    const { left, top, width, height } = parent.getBoundingClientRect();
    const x = event.clientX - left - width / 2;
    const y = event.clientY - top - height / 2;

    paths.forEach((path: HTMLElement) => {
      const speed = parseFloat(path.getAttribute('data-speed') || '1');
      const translateX = (x / width) * 20 * speed;
      const translateY = (y / height) * 10 * speed;

      this.renderer.setStyle(path, 'transform', `perspective(500px) translateX(${translateX}px) translateY(${translateY}px)`);
    });
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const parent = this.el.nativeElement;
    const paths = parent.querySelectorAll('.animate-item');

    paths.forEach((path: HTMLElement) => {
      this.renderer.setStyle(path, 'transform', 'perspective(500px) translateX(0)');
    });
  }
}
