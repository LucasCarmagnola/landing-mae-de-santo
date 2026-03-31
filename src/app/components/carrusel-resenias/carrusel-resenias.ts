import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseniasService, Resenia } from '../../services/resenias';

@Component({
  selector: 'app-carrusel-resenias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel-resenias.html',
  styleUrls: ['./carrusel-resenias.css']
})
export class CarruselReseniasComponent implements OnInit {
  private reseniasService = inject(ReseniasService);
  resenias: Resenia[] = [];

  // Usamos async en el ngOnInit para poder esperar (await) los datos
  async ngOnInit() {
    try {
      this.resenias = await this.reseniasService.obtenerResenias();
      
    } catch (error) {
      console.error('Error al traer las reseñas:', error);
    }
  }
}