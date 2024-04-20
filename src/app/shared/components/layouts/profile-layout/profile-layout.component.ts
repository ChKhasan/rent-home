import {Component, OnInit, ViewChild} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {ProfileComponent} from "../../../../pages/profile/profile/profile.component";

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent implements OnInit{
  @ViewChild(ProfileComponent) profileComponent!: ProfileComponent
 constructor(private authService: AuthService) {
 }
 ngOnInit() {
   if(typeof localStorage !== 'undefined') {
     this.authService.getUser().subscribe((data) => {
       console.log(this.profileComponent)
       console.log(data);
     })
   }
 }
}
