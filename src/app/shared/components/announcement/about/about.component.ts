import { Component, Input, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { IAnnouncementInfo } from '@services/interfaces';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit{
  @Input() announcement!: IAnnouncementInfo;
  ngOnInit(): void {
    console.log("Turmoqbek");

  }
  constructor() {
    console.log("not turmoqbel")
  }
}
