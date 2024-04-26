import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {Announcement} from "../../../../core/interfaces/common.interface";
import {CurrencyPipe, NgIf} from "@angular/common";
import {PricePipe} from "../../../pipes/price/price.pipe";

@Component({
  selector: 'app-price-block',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    PricePipe,
    NgIf,
  ],
  templateUrl: './price-block.component.html',
  styleUrl: './price-block.component.css'
})
export class PriceBlockComponent {
  @Input() announcement!: Announcement
  constructor() {}
}
