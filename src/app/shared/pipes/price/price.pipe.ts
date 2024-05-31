import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: number | string,): number | string  {
    return ['string', 'number'].includes(typeof value) ? value.toLocaleString():value;
  }
}
