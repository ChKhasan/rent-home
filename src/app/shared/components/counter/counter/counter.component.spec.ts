import { CounterComponent } from './counter.component';
import 'jasmine';
describe('CounterComponent', () => {
  let component: CounterComponent;

  beforeEach(() => {
    component = new CounterComponent();
  });

  it('should set the summ property to the sum of two numbers', () => {
    component.summer(3, 5);
    expect(component.summ).toBe(8);
  });
  it('should decrement counter if counter > 0', () => {
    component.counter = 1;
    component.increment();
    expect(component.counter).toBe(2);
  });
  it('should set the summ property to zero if both numbers are zero', () => {
    component.summer(0, 0);
    expect(component.summ).toBe(0);
  });

  it('should set the summ property to the first number if the second number is zero', () => {
    component.summer(7, 0);
    expect(component.summ).toBe(7);
  });

  it('should set the summ property to the second number if the first number is zero', () => {
    component.summer(0, 9);
    expect(component.summ).toBe(9);
  });
});
