import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly recentMessages = new Map<string, number>();
  private readonly dedupeWindowMs = 3000;

  constructor(private messageService: MessageService) {}

  showMessage(type: string, summary: string, detail: string): void {
    const localizedSummary =
      summary === 'Error' ? 'Xatolik' : summary === 'Success' ? 'Muvaffaqiyat' : summary;
    const localizedDetail =
      detail === 'Failed to fetch' || detail === 'Unknown Error'
        ? "Server bilan aloqa o'rnatilmadi."
        : detail;
    const key = `${type}:${localizedSummary}:${localizedDetail}`;
    const now = Date.now();
    const lastShownAt = this.recentMessages.get(key) || 0;
    if (now - lastShownAt < this.dedupeWindowMs) {
      return;
    }
    this.recentMessages.set(key, now);
    this.messageService.add({
      key: 'global',
      severity: type,
      summary: localizedSummary,
      detail: localizedDetail,
      life: 5000,
      closable: true,
    });
  }
}
