export type DealType = 'RENT' | 'SALE';

export const DEAL_TYPE_OPTIONS: { label: string; value: DealType }[] = [
  { label: 'Ijara', value: 'RENT' },
  { label: 'Sotuv', value: 'SALE' },
];

export const DEFAULT_DEAL_TYPE: DealType = 'RENT';

export const isDealType = (value: unknown): value is DealType => value === 'RENT' || value === 'SALE';
