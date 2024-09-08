import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
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
      url: 'https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=755&q=80',
    },
    {
      id: 126,
      url: 'https://images.unsplash.com/photo-1442850473887-0fb77cd0b337?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
    },
    {
      id: 127,
      url: 'https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=755&q=80',
    },
    {
      id: 128,
      url: 'https://images.unsplash.com/photo-1442850473887-0fb77cd0b337?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
    },
  ];
  selectedImage: any;
  // imageSize = 200; // Adjust the image size as needed

  changeImage(url: string) {
    this.selectedImage = url;
  }
}
