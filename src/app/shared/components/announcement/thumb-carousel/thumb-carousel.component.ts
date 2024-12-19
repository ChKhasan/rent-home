import { Component, Input } from '@angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-thumb-carousel',
  standalone: true,
  imports: [CarouselModule, NgForOf, NgIf, NgClass],
  templateUrl: './thumb-carousel.component.html',
  styleUrl: './thumb-carousel.component.css',
})
export class ThumbCarouselComponent {
  @Input() images!: any[];
  productImages = [
    {
      id: 125,
       image: 'assets/images/big.jpg'
    },
    {
      id: 126,
      image: 'assets/images/big.jpg'
    },
  ];
  selectedImage: any;
  // imageSize = 200; // Adjust the image size as needed

  changeImage(url: string) {
    this.selectedImage = url;
  }
}
