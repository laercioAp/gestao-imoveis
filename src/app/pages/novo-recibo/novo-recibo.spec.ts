import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoRecibo } from './novo-recibo';

describe('NovoRecibo', () => {
  let component: NovoRecibo;
  let fixture: ComponentFixture<NovoRecibo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoRecibo],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoRecibo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
