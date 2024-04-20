import { FormControl, Validators } from '@angular/forms';


export const nameControl = new FormControl("", [Validators.required,Validators.minLength(4)]);
export const lastControl = new FormControl("", [Validators.required,Validators.minLength(4)]);
export const firstControl = new FormControl("", [Validators.required,Validators.minLength(4)]);
export const titleControl = new FormControl("", [Validators.required,Validators.minLength(6)]);
export const descControl = new FormControl("", [Validators.required,Validators.minLength(10)]);
export const addressControl = new FormControl("", [Validators.required,Validators.minLength(10)]);
export const passwordControl = new FormControl(undefined, [Validators.required,Validators.pattern(/^\d{6}$/)]);
export const numberControl = new FormControl('', [Validators.required,Validators.pattern(/^\d{2} \d{3} \d{2} \d{2}$/)]);
export const emailControl = new FormControl("", [Validators.required, Validators.email]);
