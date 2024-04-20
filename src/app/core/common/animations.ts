import {animate, state, style, transition, trigger} from "@angular/animations";

export const ValidationErrorAnimation =  trigger('errorAnimation', [
  state('void', style({
    opacity: 0,
    height: 0
  })),
  transition('void <=> *', [
    animate(250)
  ])
])
export const CustomDropDownAnimation = trigger('errorAnimation', [
  state('void', style({
    opacity: 0,
    bottom: 0,
  })),
  transition('void <=> *', [
    animate(140)
  ])
])
