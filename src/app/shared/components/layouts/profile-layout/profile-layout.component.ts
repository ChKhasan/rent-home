import { Component, DestroyRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './profile-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile-layout.component.css',
})
export class ProfileLayoutComponent implements OnInit {
  public currentPath: string = '';
  constructor(
    private location: Location,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.currentPath = this.location.path();
  }

  get isChatRoute(): boolean {
    return this.currentPath.includes('/profile/chat');
  }
  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.currentPath = this.location.path();
    });
  }
}
