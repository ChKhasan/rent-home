import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {SharedModule} from "primeng/api";
import {AvatarModule} from "primeng/avatar";
import {ToastModule} from "primeng/toast";
import {NgIf} from "@angular/common";
import {BottomBarComponent} from "../bottom-bar/bottom-bar.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    AvatarModule,
    SharedModule,
    ToastModule,
    NgIf,
    BottomBarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor() {
  }
}
