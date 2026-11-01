import { TestBed } from '@angular/core/testing';

import { Gestao } from './gestao';

describe('Gestao', () => {
  let service: Gestao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gestao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
