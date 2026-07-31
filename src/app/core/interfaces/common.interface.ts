import type { components, paths } from './schema';
import type { DealType } from '@/core/constants/deal-type';

export type IAnnouncementInfo = paths['/api/announcement/{id}/']['get']['responses']['200']['content']['application/json'];
export type IAnnouncementListItem = paths['/api/announcement/']['get']['responses']['200']['content']['application/json']['results'];
export type IAnnouncementRequestBody = paths['/api/announcement/']['post']['requestBody']['content']['application/json'];

export type Transport = components['schemas']['Transport'];

export type ICommentResquestBody = paths['/api/comment/']['post']['requestBody']['content']['application/json'];
export type ICommentInfo = paths['/api/comment/{id}/']['get']['responses']['200']['content']['application/json'];
export type IcommentList = paths['/api/comment/']['get']['responses']['200']['content']['application/json'];

export type UserImages = components['schemas']['Image'];
export type IUserInfo = components['schemas']['UserMe'];
export type IUserForChat = components['schemas']['UserForChat'];
export interface IAgencyInfo {
  id: number;
  name: string;
  inn?: string | null;
  license_number?: string | null;
  address?: string | null;
  contact_phone?: string | null;
  logo?: string | null;
  is_active: boolean;
  created?: string;
  updated?: string;
}
export interface IGendersList {
  name?: string;
  description?: string | null;
  id?: number;
}

export interface ICommonResponse {
  page: number;
  page_size: number;
  count: number;
}

export interface IAnnouncementList extends ICommonResponse {
  results: IAnnouncementListItem[];
}

export interface Login {
  phone_number: string;
  password: string;
}

export interface Likes {
  [index: number]: number;
}

export interface QueryList {
  [key: string]: any;
}

export interface FilterForm {
  conditioner: Boolean;
  washing_machine: Boolean;
  fridge: Boolean;
  partnership: Boolean;
  need_people_count: Number | null;
  total_price__gte: Number | null;
  total_price__lte: Number | null;
  room_count: Number | null;
  transports: [];
  region: null | number;
  district: null | number;
  currency: any;
  floor: null | number;
  deal_type?: DealType;
}

export interface IUserRooms {
  created_at?: string;
  id: number;
  message?: string;
  messages: any[];
  name: string;
  user?: IUserForChat;
  users: IUserForChat[];
}
export interface IMessage {
  created_at?: string;
  id: number;
  is_read: boolean;
  message: string;
  receiver: number;
  room: number;
  sender: number;
  is_first?: boolean;
}

export interface IMessageObj {
  created_at?: string;
  is_first?: boolean;
  id: number;
  is_read: boolean;
  messages: IMessage[];
  name: string;
  users: IUserInfo[];
}

export interface IAgencyMembership {
  id: number;
  role: 'owner' | 'staff';
  is_active: boolean;
  created?: string;
  agency: {
    id: number;
    name: string;
    inn?: string | null;
    license_number?: string | null;
    address?: string | null;
    contact_phone?: string | null;
    logo?: string | null;
    is_active: boolean;
    created?: string;
    updated?: string;
  };
}
