export interface Announcement {
  transports: any,
  images: UserImages[],
  title: string,
  partnership: boolean,
  need_people_count: number,
  room_count: number,
  address: string,
  location_x: number | string,
  location_y: number | string,
  currency: string,
  total_price: number,
  price_for_one: number,
  appartment_status: number,
  description: string,
  conditioner: boolean,
  washing_machine: boolean,
  user: UserInfo,
}

export interface CommentPayload {
  comment: string,
  announcement: number | null,
}

export interface CommentResponse {
  comment: string,
  announcement: number | null,
  created: string | undefined,
  user: UserInfo
}

export interface UserInfo {
  email: string | null,
  first_name: string | null,
  id?: number,
  last_name: string | null,
  name: string | null,
  is_online?: boolean,
  images: UserImages[]
}

export interface UserImages {
  id: number,
  uuid: string,
  image: string,
  name: string | null
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

export interface IUserRooms {
  created_at?: string,
  id: number,
  message?: string,
  messages: any[],
  name: string,
  user?: UserInfo,
  users: UserInfo[]
}

export interface IMessage {
  created_at?: string,
   id: number,
  is_read: boolean,
  message: string,
  receiver: number,
  room: number,
  sender: number,
  is_first?: boolean,
}

export interface IMessageObj {
  created_at?: string,
  is_first?: boolean,
  id: number,
  is_read: boolean,
  messages: IMessage[],
  name: string
  users: UserInfo[]
}
