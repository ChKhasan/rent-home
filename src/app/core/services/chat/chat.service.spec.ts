import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('uses last_message metadata and sorts rooms by latest activity', () => {
        const rooms: any[] = [
            {
                id: 1,
                created_at: '2026-08-01T10:00:00Z',
                users: [{ id: 10 }, { id: 20, name: 'Old' }],
                messages: [],
                last_message: { message: 'Eski', created_at: '2026-08-01T11:00:00Z' },
                unread_count: 0,
            },
            {
                id: 2,
                created_at: '2026-08-02T10:00:00Z',
                users: [{ id: 10 }, { id: 30, name: 'New' }],
                messages: [],
                last_message: { message: 'Yangi', created_at: '2026-08-02T11:00:00Z' },
                unread_count: 3,
            },
        ];

        const result = service.prepareRooms(rooms, 10);

        expect(result.map((room) => room.id)).toEqual([2, 1]);
        expect(result[0].message).toBe('Yangi');
        expect(result[0].unread_count).toBe(3);
        expect(result[0].user.id).toBe(30);
    });

    it('closes and releases the active socket on disconnect', () => {
        const socket = { closed: false, complete: vi.fn().mockName('complete') };
        const subscription = { unsubscribe: vi.fn().mockName('unsubscribe') };
        (service as any).socket$ = socket;
        (service as any).socketSubscription = subscription;

        service.disconnect();

        expect(socket.complete).toHaveBeenCalled();
        expect(subscription.unsubscribe).toHaveBeenCalled();
        expect(service.send({ message: 'secret' })).toBe(false);
    });
});
