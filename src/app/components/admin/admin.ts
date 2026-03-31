import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurnoService } from '../../services/turno';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { ReseniasService, Resenia } from '../../services/resenias';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private turnoService = inject(TurnoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private reseniasService = inject(ReseniasService);

  turnosPendientes: any[] = [];
  turnosConfirmados: any[] = [];
  
  turnosFinalizados: any[] = [];
  resenias: Resenia[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.turnosPendientes = await this.turnoService.obtenerTurnosPorEstado('pendiente');
      this.turnosConfirmados = await this.turnoService.obtenerTurnosPorEstado('confirmado');

      console.log('turnos pendientes:', this.turnosPendientes);
      
      // 1. ORDENAR AGENDA (Confirmados): Por fecha y hora (los más próximos arriba)
      this.turnosConfirmados.sort((a, b) => {
        // Unimos fecha y hora para poder compararlos (ej: "2026-04-15T16:00")
        const fechaHoraA = `${a.fechaArgentina}T${a.horaArgentina}`;
        const fechaHoraB = `${b.fechaArgentina}T${b.horaArgentina}`;
        return fechaHoraA.localeCompare(fechaHoraB);
      });

      // 2. ORDENAR PENDIENTES: Por fecha de creación (los más viejos, que están por vencer, arriba)
      this.turnosPendientes.sort((a, b) => {
        // Firebase guarda la fecha de creación como un objeto Timestamp que tiene "seconds"
        const tiempoA = a.fechaCreacion?.seconds || 0;
        const tiempoB = b.fechaCreacion?.seconds || 0;
        return tiempoA - tiempoB; 
      });

      // 3. CALCULAR EL TIEMPO RESTANTE PARA CADA TURNO PENDIENTE
      this.turnosPendientes.forEach(turno => {
        const infoTiempo = this.calcularTiempoRestante(turno.fechaCreacion);
        turno.textoTiempo = infoTiempo.texto;
        turno.estaVencido = infoTiempo.vencido;
      });

      this.turnosFinalizados = await this.turnoService.obtenerTurnosPorEstado('finalizado');
      this.resenias = await this.reseniasService.obtenerResenias();

    } catch (error) {
      console.error("Error al cargar turnos", error);
    }
  }

  calcularTiempoRestante(timestamp: any): { texto: string, vencido: boolean } {
    // Si no hay fecha, no podemos calcular nada
    if (!timestamp) {
      return { texto: 'Falta fecha de creación', vencido: true };
    }

    let creacionMs = 0;

    // A PRUEBA DE BALAS: Chequeamos todos los formatos posibles
    if (typeof timestamp.toDate === 'function') {
      // 1. Es un Timestamp normal de Firebase
      creacionMs = timestamp.toDate().getTime();
    } else if (timestamp.seconds) {
      // 2. Es un objeto crudo de Firebase
      creacionMs = timestamp.seconds * 1000;
    } else if (timestamp instanceof Date) {
      // 3. Es un objeto Date de JavaScript
      creacionMs = timestamp.getTime();
    } else if (typeof timestamp === 'number') {
      // 4. Ya está en milisegundos
      creacionMs = timestamp;
    } else if (typeof timestamp === 'string') {
      // 5. Se guardó como texto ISO
      creacionMs = new Date(timestamp).getTime();
    }

    // Si fallaron todos los chequeos, avisamos en la consola para investigar
    if (creacionMs === 0 || isNaN(creacionMs)) {
      console.error('🚨 Error leyendo la fecha del turno:', timestamp);
      return { texto: 'Error de formato', vencido: true };
    }

    // Le sumamos 4 horas (4 horas * 60 min * 60 seg * 1000 ms)
    const limiteMs = creacionMs + (4 * 60 * 60 * 1000);
    const ahoraMs = new Date().getTime();
    const diferenciaMs = limiteMs - ahoraMs;

    // Si la diferencia es negativa, se pasó el tiempo
    if (diferenciaMs <= 0) {
      return { texto: 'Tiempo agotado (Liberar)', vencido: true };
    }

    // Calculamos horas y minutos restantes
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      return { texto: `Vence en ${horas}h ${minutos}m`, vencido: false };
    } else {
      return { texto: `Vence en ${minutos}m`, vencido: false };
    }
  }

  async confirmar(id: string) {
    try {
      await this.turnoService.confirmarTurno(id);
      this.snackBar.open('Turno confirmado con éxito ✅', 'Cerrar', { duration: 3000 });
      this.cargarDatos(); // Recargamos las listas para que pase de una pestaña a la otra
    } catch (error) {
      this.snackBar.open('Error al confirmar', 'Cerrar', { duration: 3000 });
    }
  }

  async cancelar(id: string) {
    if(confirm('¿Estás segura de liberar este turno? Esta acción no se puede deshacer.')) {
      try {
        await this.turnoService.eliminarTurno(id);
        this.snackBar.open('Turno liberado 🗑️', 'Cerrar', { duration: 3000 });
        this.cargarDatos();
      } catch (error) {
        this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    }
  }

  async salir() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async finalizar(idTurno: string) {
    if(confirm('¿Estás seguro de marcar este turno como finalizado?')) {
      try{
        await this.turnoService.finalizarTurno(idTurno);
        this.snackBar.open('Turno finalizado con éxito ✅', 'Cerrar', { duration: 3000 });
        this.cargarDatos(); 
      } catch(error){
        this.snackBar.open('Error al finalizar', 'Cerrar', { duration: 3000 });
      }
    }
  }

  async borrarResenia(idResenia: string | undefined) {
    // 1. Chequeo de seguridad: si por alguna razón extraña llega a ser undefined, cortamos acá.
    if (!idResenia) {
      console.error('Error: Intentaste borrar una reseña sin ID.');
      return; 
    }

    // 2. A partir de esta línea, TypeScript ya sabe que idResenia es 100% un string válido.
    if(confirm('¿Estás seguro de eliminar esta reseña? No se puede deshacer.')) {
      try{
        await this.reseniasService.eliminarResenia(idResenia); 
        this.snackBar.open('Reseña eliminada 🗑️', 'Cerrar', { duration: 3000 });
        this.cargarDatos(); // Recargamos la lista para que desaparezca

      }catch(error){
        this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    }
  }

}