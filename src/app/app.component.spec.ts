import { AppComponent } from './app.component';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  it('is defined', () => {
    expect(AppComponent).toBeDefined();
  });

  it('disconnects and clears chat state when auth becomes false', () => {
    const authState = new BehaviorSubject<boolean>(true);
    const chatService = {
      disconnect: jasmine.createSpy('disconnect'),
      clearRooms: jasmine.createSpy('clearRooms'),
      webSocketConnection: jasmine.createSpy('webSocketConnection'),
      onMessage: () => new BehaviorSubject<any>(null),
      __GET_USER_ROOMS: jasmine.createSpy('__GET_USER_ROOMS'),
    };
    const component = new AppComponent(
      { reloadLikes: () => undefined } as any,
      {
        user: { id: 1 },
        authHandler: () => Promise.resolve(),
        getBooleanValue: () => authState.asObservable(),
      } as any,
      { path: () => '/profile/chat' } as any,
      chatService as any,
      { clear: jasmine.createSpy('clear') } as any,
      {} as any,
      { __GET_REGIONS: () => undefined } as any,
    );

    component.ngOnInit();
    authState.next(false);

    expect(chatService.disconnect).toHaveBeenCalled();
    expect(chatService.clearRooms).toHaveBeenCalled();
    component.ngOnDestroy();
  });
});
