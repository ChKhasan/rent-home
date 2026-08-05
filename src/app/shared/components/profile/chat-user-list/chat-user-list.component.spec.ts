import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserListComponent } from './chat-user-list.component';

describe('ChatUserListComponent', () => {
  let component: ChatUserListComponent;
  let fixture: ComponentFixture<ChatUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUserListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders each room as a named native button with real metadata', () => {
    component.loading = false;
    component.isRoom = { id: 7 };
    component.handlerRoom = jasmine.createSpy('handlerRoom');
    component.userRooms = [{
      id: 7,
      name: 'room',
      users: [],
      messages: [],
      user: { id: 2, name: 'Ali', images: [], is_online: true } as any,
      message: 'Salom',
      unread_count: 2,
      last_message: { created_at: '2026-08-05T12:34:00Z' } as any,
    }];

    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.user-card');

    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('aria-label')).toContain('Ali bilan suhbat');
    expect(fixture.nativeElement.querySelector('.room-time').textContent.trim()).not.toBe('17:36');
    expect(component.getUnreadMessageCount(component.userRooms[0])).toBe('2');
  });
});
