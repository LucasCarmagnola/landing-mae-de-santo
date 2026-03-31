import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReseniasService, Resenia } from '../../services/resenias'; 

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.css']
})
export class ComentariosComponent implements OnInit {
  private reseniasService = inject(ReseniasService);
  private fb = inject(FormBuilder);

  resenias: Resenia[] = [];
  reseniaForm: FormGroup;
  enviando = false;

  constructor() {
    this.reseniaForm = this.fb.group({
      nombre: [''], // Campo opcional
      mensaje: ['', [Validators.required, Validators.maxLength(250)]] // Límite de 250 caracteres
    });
  }

  ngOnInit() {
    // Nos suscribimos para traer las reseñas en tiempo real
    // this.reseniasService.obtenerResenias().subscribe(data => {
    //   this.resenias = data;
    // });
  }

  async enviarResenia() {
    if (this.reseniaForm.invalid) return;

    this.enviando = true;
    let { nombre, mensaje } = this.reseniaForm.value;

    // Lógica para el nombre Anónimo
    if (!nombre || nombre.trim() === '') {
      nombre = 'Anónimo';
    }

    const nuevaResenia: Resenia = {
      nombre: nombre.trim(),
      mensaje: mensaje.trim(),
      fecha: new Date() // Podés usar serverTimestamp() de Firestore si lo preferís
    };

    try {
      await this.reseniasService.agregarResenia(nuevaResenia);
      this.reseniaForm.reset(); // Limpiamos el formulario tras el éxito
    } catch (error) {
      console.error('Error al publicar la reseña:', error);
    } finally {
      this.enviando = false;
    }
  }
}