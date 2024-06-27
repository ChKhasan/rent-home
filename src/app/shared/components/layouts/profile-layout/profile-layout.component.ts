import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {BottomBarComponent} from "../bottom-bar/bottom-bar.component";
import {Location, NgClass, NgIf} from "@angular/common";
import {filter} from "rxjs";
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    BottomBarComponent,
    NgIf,
    NgClass
  ],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent implements OnInit{
 public currentPath: string = ''
  constructor(
    private location: Location,
    private router: Router
  ) {
    this.currentPath = this.location.path();
  }
 ngOnInit() {
   this.router.events.pipe(
     filter(event => event instanceof NavigationEnd)
   ).subscribe(() => {
     this.currentPath = this.location.path();
   });

 }
}
