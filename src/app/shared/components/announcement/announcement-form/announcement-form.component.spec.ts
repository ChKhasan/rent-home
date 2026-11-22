import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { AnnouncementFormComponent } from './announcement-form.component';

describe('AnnouncementFormComponent', () => {
  let component: AnnouncementFormComponent;
  let fixture: ComponentFixture<AnnouncementFormComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementFormComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    http.expectOne((request) => request.url === '/api/regions/' && request.params.get('level') === '1').flush({
      results: [{ id: 1, name: 'Toshkent', level: 1, parent: null }],
    });
    http.expectOne('/api/lessee-types/').flush({ results: [] });
    http.expectOne('/api/publisher-capabilities/').flush({
      publisher_capabilities: {
        can_publish_as_owner: true,
        can_publish_as_independent_agent: false,
        independent_agent_available: false,
        agencies: [],
      },
    });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders PrimeNG region and district selects', () => {
    component.currentStep = 2;
    component.ruleForm.patchValue({ region: 1, district: null });
    component.onRegionChange(1);

    const request = http.expectOne((item) => item.url === '/api/regions/' && item.params.get('parent') === '1');
    expect(request.request.params.get('page_size')).toBe('100');
    request.flush({
      results: [{ id: 11, name: 'Yunusobod', level: 2, parent: 1 }],
    });
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('p-select');
    expect(selects.length).toBe(2);
    expect(component.dictionaryService.regions[0].name).toBe('Toshkent');
    expect(component.dictionaryService.districts[0].name).toBe('Yunusobod');
  });

  it('clears the old district when the region changes', () => {
    component.ruleForm.patchValue({ region: 1, district: 99 });
    component.dictionaryService.districts = [{ id: 99, name: 'Eski tuman', level: 2, parent: 2 }];

    component.onRegionChange(1);

    expect(component.ruleForm.controls.district.value).toBeNull();
    expect(component.dictionaryService.districts).toEqual([]);
    http.expectOne((item) => item.url === '/api/regions/' && item.params.get('parent') === '1').flush({ results: [] });
  });
});
