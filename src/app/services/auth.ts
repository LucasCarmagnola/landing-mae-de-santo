import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  // Variable que observa si hay alguien logueado o no
  usuario$: Observable<any> = authState(this.auth);

  // Función para iniciar sesión
  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Función para cerrar sesión
  logout() {
    return signOut(this.auth);
  }
}