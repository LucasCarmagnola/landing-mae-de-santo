import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { BookingStepper } from '../booking-stepper/booking-stepper';
import { About } from '../about/about';
import { HowItWorks } from '../how-it-works/how-it-works';
import { ServicesComponent } from '../services/services';
import {  ComentariosComponent } from '../comentarios/comentarios';
import { CarruselReseniasComponent } from '../carrusel-resenias/carrusel-resenias';

@Component({
  selector: 'app-home',
  imports: [Hero, Navbar, Footer, BookingStepper, About, HowItWorks, ServicesComponent, ComentariosComponent, CarruselReseniasComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
