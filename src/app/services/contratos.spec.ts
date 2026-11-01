import { TestBed } from '@angular/core/testing';

import { Contratos } from './contratos';

describe('Contratos', () => {
  let service: Contratos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Contratos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
