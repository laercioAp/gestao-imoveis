import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Imoveis } from './imoveis';

describe('Imoveis', () => {
  let component: Imoveis;
  let fixture: ComponentFixture<Imoveis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Imoveis],
    }).compileComponents();

    fixture = TestBed.createComponent(Imoveis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
