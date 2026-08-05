import type { components, paths } from './schema';
import type { DealType } from '@/core/constants/deal-type';

export type PublisherType = 'OWNER' | 'INDEPENDENT_AGENT' | 'AGENCY_AGENT';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
export type CommissionType = 'PERCENTAGE' | 'FIXED' | 'NONE';

export interface IPublisherProjection {
  type: PublisherType | null;
  label: string;
  display_name: string;
  responsible_person?: {
    id: number;
    user_id: number;
    name: string;
    avatar?: string | null;
  } | null;
  agency?: {
    id: number;
    name: string;
    logo?: string | null;
    verification_status: VerificationStatus;
  } | null;
  broker_profile?: {
    id: number;
    verification_status: VerificationStatus;
  } | null;
  verification_status?: VerificationStatus | null;
  phone?: string | null;
  other_listing_count?: number;
}

export interface ICommissionProjection {
  type: CommissionType;
  value: string | null;
  currency: 'UZS' | 'USD' | null;
  label: string;
}

export interface IPublisherAnnouncementFields {
  publisher_type?: PublisherType | null;
  publisher?: IPublisherProjection | null;
  commission?: ICommissionProjection | null;
  commission_type?: CommissionType | null;
  commission_value?: string | number | null;
  commission_currency?: 'UZS' | 'USD' | null;
  last_confirmed_at?: string | null;
}

export type IAnnouncementInfo = paths['/api/announcement/{id}/']['get']['responses']['200']['content']['application/json'] & IPublisherAnnouncementFields;
export type IAnnouncementListItem = components['schemas']['Announcement'] & IPublisherAnnouncementFields;
export type IAnnouncementRequestBody = paths['/api/announcement/']['post']['requestBody']['content']['application/json'] & IPublisherAnnouncementFields;

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
  verification_status?: VerificationStatus;
  verification_updated_at?: string | null;
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
  publisher_type: PublisherType[];
  verified_only: boolean;
  commission_free: boolean;
}

export interface IUserRooms {
  created_at?: string;
  id: number;
  message?: string;
  messages: any[];
  last_message?: IMessage | null;
  unread_count?: number;
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
  client_id?: string;
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
  role: 'OWNER' | 'MANAGER' | 'BROKER';
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
    verification_status?: VerificationStatus;
    created?: string;
    updated?: string;
  };
}
