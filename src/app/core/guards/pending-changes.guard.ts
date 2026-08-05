import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesAware {
  hasUnsavedChanges(): boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesAware> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  return typeof window === 'undefined'
    || window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqilsinmi?");
};
