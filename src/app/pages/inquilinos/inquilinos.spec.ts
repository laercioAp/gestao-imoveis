import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inquilinos } from './inquilinos';

describe('Inquilinos', () => {
  let component: Inquilinos;
  let fixture: ComponentFixture<Inquilinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inquilinos],
    }).compileComponents();

    fixture = TestBed.createComponent(Inquilinos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
