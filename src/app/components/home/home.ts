import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { BookingStepper } from '../booking-stepper/booking-stepper';
import { About } from '../about/about';
import { HowItWorks } from '../how-it-works/how-it-works';
import { ServicesComponent } from '../services/services';

@Component({
  selector: 'app-home',
  imports: [Hero, Navbar, Footer, BookingStepper, About, HowItWorks, ServicesComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
