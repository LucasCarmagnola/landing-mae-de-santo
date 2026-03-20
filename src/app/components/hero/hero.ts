import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hero',
  imports: [MatButtonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {

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
