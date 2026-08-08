import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import { ChatService } from '@services/chat';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatService: ChatService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        chatService = TestBed.inject(ChatService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('does not send a whitespace-only message', () => {
        const send = vi.spyOn(chatService, 'send').mockReturnValue(true);
        component.authService.auth = true;
        component.authService.user = { id: 1 };
        component.isRoom = { id: 9, user: { id: 2 } };
        component.message = '   ';

        component.sendMessage();

        expect(send).not.toHaveBeenCalled();
        expect(component.pendingMessages).toEqual([]);
    });

    it('keeps a failed optimistic message available for retry', () => {
        vi.spyOn(chatService, 'send').mockReturnValue(true);
        component.authService.auth = true;
        component.authService.user = { id: 1 };
        component.isRoom = { id: 9, user: { id: 2 } };
        component.message = '  Salom  ';

        component.sendMessage();
        const pending = component.pendingMessages[0];
        component.commandController({
            type: 'error',
            client_id: pending.client_id,
            message: 'Message is required',
        });

        expect(pending.message).toBe('Salom');
        expect(pending.pending).toBe(false);
        expect(pending.error).toBe('Message is required');
    });

    it('shows a controlled state for an unknown room id', () => {
        vi.spyOn((component as any).queryService, 'activeQueryList').mockReturnValue({ roomId: '999' });
        component.userRooms = [];

        component.findCurrentRoom();

        expect(component.invalidRoom).toBe(true);
        expect(component.isRoom).toEqual({});
    });
});
