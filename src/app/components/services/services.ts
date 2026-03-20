import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ScrollRevealDirective } from '../../directives/scroll-reveal';
// Importamos CommonModule para poder usar pipes como currency
import { CommonModule } from '@angular/common'; 
import { Dolar } from '../../services/dolar';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, ScrollRevealDirective, CommonModule,],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class ServicesComponent {
  precioUsd = 100;
  precioArs = 0; 
  private dolarService = inject(Dolar);


  ngOnInit() {
    this.obtenerCotizacion();
  }

  obtenerCotizacion() {
    this.dolarService.getDolarBlue().subscribe({
      next: (data) => {
        // La API devuelve un objeto con 'compra' y 'venta'. Usamos 'venta'.
        const valorDolar = data.venta;
        
        // Calculamos el precio en pesos
        this.precioArs = this.precioUsd * valorDolar;
      },
      error: (err) => {
        console.error('No se pudo conectar con DolarAPI', err);
        // Si la API se cae, el precioArs queda en 0 y el HTML 
        // automáticamente oculta la línea en pesos gracias al *ngIf="precioArs > 0"
      }
    });
  }

  irAReservar() {
    const seccionTurnos = document.getElementById('seccion-reserva');
    
    if (!seccionTurnos) return; // Si no encuentra la sección, no hace nada

    // 1. Calculamos las distancias
    const targetPosition = seccionTurnos.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // 2. Definimos el tiempo total de la animación (en milisegundos)
    const duration = 1200; // 1.2 segundos da un efecto súper relajado y elegante
    let startTimestamp: number | null = null;

    // 3. Creamos la función matemática de aceleración (Ease-In-Out Cubic)
    // Esto hace que arranque suave, acelere en el medio, y frene suave al final
    const easeInOutCubic = (t: number) => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // 4. Ejecutamos la animación cuadro por cuadro
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      
      // Calculamos el porcentaje de tiempo transcurrido (de 0 a 1)
      let percentage = progress / duration;
      if (percentage > 1) percentage = 1; // Para que no se pase de largo

      // Aplicamos la curva de aceleración al porcentaje
      const easeProgress = easeInOutCubic(percentage);

      // Movemos la pantalla un poquitito en este cuadro
      window.scrollTo(0, startPosition + distance * easeProgress);

      // Si todavía no llegamos al tiempo total, pedimos el siguiente cuadro
      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };

    // ¡Arranca la magia!
    window.requestAnimationFrame(step);
  }

}