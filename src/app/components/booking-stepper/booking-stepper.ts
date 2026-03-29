import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Módulos de Angular Material
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // <-- AGREGADO
import { formatInTimeZone } from 'date-fns-tz';
import { Dolar } from '../../services/dolar';
import { TurnoService } from '../../services/turno';

@Component({
  selector: 'app-booking-stepper',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSnackBarModule // <-- AGREGADO
  ],
  templateUrl: './booking-stepper.html',
  styleUrl: './booking-stepper.css',
})
export class BookingStepper implements OnInit {

  @ViewChild(MatStepper) stepper!: MatStepper; // <-- AGREGADO: Nos permite controlar el Stepper desde el código

  private fb = inject(FormBuilder);
  //private dolarService = inject(Dolar);
  private turnoService = inject(TurnoService);
  private snackBar = inject(MatSnackBar); // <-- AGREGADO: El servicio para mostrar mensajitos

  precioUsd = 100;
  precioArs = 80000;
  
  // Paso 1: Elegir el servicio
  step1Form: FormGroup = this.fb.group({
    servicio: ['Diagnostico Espiritual', Validators.required]
  });

  // Paso 2: Zona Horaria
  step2Form: FormGroup = this.fb.group({
    timezone: ['', Validators.required]
  });

  // Paso 3: Fecha y Hora
  step3Form: FormGroup = this.fb.group({
    fecha: ['', Validators.required],
    hora: ['', Validators.required]
  });

  // Paso 4: Datos del Cliente
  step4Form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    codigoPais: ['+54', Validators.required],
    whatsapp: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
  });

  // Datos "de mentira" para probar la interfaz
  paisesDisponibles = [
    { id: 'Europe/Berlin', nombre: 'Alemania', codigoTel: '+49' },
    { id: 'America/Argentina/Buenos_Aires', nombre: 'Argentina', codigoTel: '+54' },
    { id: 'America/Santiago', nombre: 'Chile', codigoTel: '+56' },
    { id: 'America/Bogota', nombre: 'Colombia', codigoTel: '+57' },
    { id: 'Europe/Madrid', nombre: 'España', codigoTel: '+34' },
    { id: 'America/New_York', nombre: 'Estados Unidos', codigoTel: '+1' },
    { id: 'Europe/Paris', nombre: 'Francia', codigoTel: '+33' },
    { id: 'Europe/Rome', nombre: 'Italia', codigoTel: '+39' },
    { id: 'America/Mexico_City', nombre: 'México', codigoTel: '+52' },
    { id: 'America/Montevideo', nombre: 'Uruguay', codigoTel: '+598' }
  ];

  fechaMinima = new Date();
  horariosDisponibles: { local: string, arg: string, fechaArg: string }[] = [];

  ngOnInit() {
    // Apenas carga el stepper, buscamos la cotización
    // this.dolarService.getDolarBlue().subscribe({
    //   next: (data) => {
    //     this.precioArs = this.precioUsd * data.venta;
    //   }
    // });
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo números (del 0 al 9 en código ASCII)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Método final para enviar a WhatsApp
  async confirmarTurno() {
    const servicio = this.step1Form.value.servicio;
    const zonaCliente = this.step2Form.value.timezone;
    const nombre = this.step4Form.value.nombre;
    const email = this.step4Form.value.email;
    const whatsappCliente = this.step4Form.value.codigoPais + this.step4Form.value.whatsapp;

    // AHORA SACAMOS LOS DATOS DEL OBJETO QUE CREAMOS
    const turnoElegido = this.step3Form.value.hora; 
    const horaLocal = turnoElegido.local;
    const horaArg = turnoElegido.arg;
    const fechaArg = turnoElegido.fechaArg;

    // Para mostrar en WhatsApp formateamos la fecha a DD/MM/YYYY
    const [anio, mes, dia] = fechaArg.split('-');
    const fechaStrVisual = `${dia}/${mes}/${anio}`;
    
    const datosParaFirebase = {
      servicio: servicio,
      precioUsd: this.precioUsd,
      precioArsAprox: this.precioArs,
      zonaHorariaCliente: zonaCliente,
      horaReservaLocal: horaLocal,
      fechaArgentina: fechaArg, 
      horaArgentina: horaArg,   
      cliente: {
        nombre: nombre,
        email: email,
        telefono: whatsappCliente
      }
    };

    try {
      await this.turnoService.guardarTurno(datosParaFirebase);

      const textoPrecio =`$${this.precioArs} ARS`
      const mensaje = `Hola! Acabo de reservar un turno para ${servicio}.
            👤 A nombre de: ${nombre}.
            🗓️ Fecha y Hora: ${fechaStrVisual} a las ${horaLocal}.
            💰 A continuación te envío el comprobante de pago por ${textoPrecio}.`;

      const numeroWhatsApp = '5491132157197'; 
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

      // 1. MOSTRAR MENSAJE DE ÉXITO PRIMERO
      this.snackBar.open('¡Turno reservado con éxito! Redirigiendo a WhatsApp...', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // 2. VACIAR EL FORMULARIO PARA QUE SE VEA LIMPIO
      this.stepper.reset();
      this.horariosDisponibles = [];

      // 3. ESPERAR 500ms Y REDIRIGIR A WHATSAPP
      setTimeout(() => {
        // Usamos location.href en lugar de window.open('_blank') 
        // porque los navegadores suelen bloquear las ventanas emergentes (pop-ups) 
        // cuando ocurren adentro de un setTimeout. En celular, esto abre la app directo igual.
        window.location.href = url; 
      }, 500);

    } catch (error) {
      this.snackBar.open('Hubo un problema al reservar el turno. Por favor, intentá de nuevo.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async actualizarHorarios() {
    const fechaSeleccionada = this.step3Form.value.fecha;
    const zonaCliente = this.step2Form.value.timezone;

    if (!fechaSeleccionada || !zonaCliente) {
      this.horariosDisponibles = [];
      return;
    }

    this.horariosDisponibles = [];

    const anio = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
    
    // Armamos la fecha base para consultar en Firebase (ej: "2026-04-15")
    const fechaArgStr = `${anio}-${mes}-${dia}`;

    // ¡LE PREGUNTAMOS A FIREBASE QUÉ HORARIOS YA ESTÁN OCUPADOS!
    const turnosOcupados = await this.turnoService.obtenerTurnosOcupados(fechaArgStr);

    const ahoraConMargen = new Date().getTime() + (60 * 60 * 1000);

    for (let i = 8; i <= 19; i++) {
      const horaArgStr = String(i).padStart(2, '0') + ':00'; // Ej: "08:00"
      
      // EL GRAN FILTRO: Si la hora ya está en Firebase, la saltamos (continue)
      if (turnosOcupados.includes(horaArgStr)) {
        continue; 
      }

      const fechaEnArgentina = new Date(`${fechaArgStr}T${horaArgStr}:00-03:00`);

      if (fechaEnArgentina.getTime() > ahoraConMargen) {
        const horaConvertida = formatInTimeZone(fechaEnArgentina, zonaCliente, 'HH:mm');
        
        // Guardamos el objeto completo
        this.horariosDisponibles.push({
          local: horaConvertida,
          arg: horaArgStr,
          fechaArg: fechaArgStr
        });
      }
    }
  }

  filtroFinesDeSemana = (d: Date | null): boolean => {
    const fecha = d || new Date()
    const dia = fecha.getDay()
    
    // 0 es Domingo y 6 es Sábado.
    return dia !== 0 && dia !== 6
  }

}