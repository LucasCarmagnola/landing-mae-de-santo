import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Dolar {
  private http = inject(HttpClient);

  // Traemos los datos del Dólar Blue
  getDolarBlue(): Observable<any> {
    return this.http.get('https://dolarapi.com/v1/dolares/blue');
  }
}
