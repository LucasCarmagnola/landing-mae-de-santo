import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { BookingStepper } from './components/booking-stepper/booking-stepper';
import { Hero } from './components/hero/hero';
import { Navbar } from './components/navbar/navbar';
import { About } from './components/about/about';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { ServicesComponent } from './components/services/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, BookingStepper, Hero, Navbar, ServicesComponent, About, HowItWorks],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('landing-page-cecilia');
}
