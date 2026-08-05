import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingCardSkeletonComponent } from './listing-card-skeleton.component';

describe('ListingCardSkeletonComponent', () => {
  let fixture: ComponentFixture<ListingCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListingCardSkeletonComponent] }).compileComponents();
    fixture = TestBed.createComponent(ListingCardSkeletonComponent);
    fixture.detectChanges();
  });

  it('renders the stable card media and content structure', () => {
    expect(fixture.nativeElement.querySelector('.listing-skeleton__media')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.listing-skeleton__body')).not.toBeNull();
  });
});
