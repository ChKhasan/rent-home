import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentBlockComponent } from './comment-block.component';

describe('CommentBlockComponent', () => {
  let component: CommentBlockComponent;
  let fixture: ComponentFixture<CommentBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
