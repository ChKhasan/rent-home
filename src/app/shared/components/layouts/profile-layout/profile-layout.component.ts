import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {BottomBarComponent} from "../bottom-bar/bottom-bar.component";
@Component({
  selector: 'app-profile-layout',
  standalone: true,
    imports: [
        RouterOutlet,
        FooterComponent,
        HeaderComponent,
        BottomBarComponent
    ],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {


}
