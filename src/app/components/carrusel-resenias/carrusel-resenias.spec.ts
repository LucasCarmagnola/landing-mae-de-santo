import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselResenias } from './carrusel-resenias';

describe('CarruselResenias', () => {
  let component: CarruselResenias;
  let fixture: ComponentFixture<CarruselResenias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselResenias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselResenias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
