import {FormControl, FormGroup} from "@angular/forms";

export interface Announcement {
  userId: number,
  id: number,
  title: string,
  body: string,
  images: any[]
}

export interface CommentPayload {
  comment: string,
  announcement: number | null,
}

export interface CommentResponse {
  comment: string,
  announcement: number | null,
  created: string | undefined,
  user: {
    email: string | null,
    first_name: string | null,
    id: number,
    last_name: string | null,
    name: string | null,
  }
}
export interface UserInfo {
  email: string | null,
  first_name: string | null,
  id?: number,
  last_name: string | null,
  name: string | null,
}
export interface Login {
  phone_number: string,
  password: string,
}

export interface Likes {
  [index: number]: number;
}

export interface QueryList {
  [key: string]: any
}

export interface FilterForm {
  conditioner: Boolean,
  partnership: Boolean,
  washing_machine: Boolean,
  need_people_count: Number,
  total_price__gte: Number,
  total_price__lte: Number,
  room_count: Number,
}
