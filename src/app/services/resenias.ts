import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

export interface Resenia {
  id?: string;
  nombre: string;
  mensaje: string;
  fecha: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReseniasService {
  private firestore = inject(Firestore);

  // Guarda la reseña nueva en Firebase
  async agregarResenia(resenia: Resenia) {
    const reseniasRef = collection(this.firestore, 'resenias');
    return await addDoc(reseniasRef, resenia);
  }

  // Trae todas las reseñas usando la misma lógica que tus Turnos (getDocs)
  async obtenerResenias() {
    const reseniasRef = collection(this.firestore, 'resenias');
    const q = query(reseniasRef, orderBy('fecha', 'desc'));
    
    const snapshot = await getDocs(q);
    
    // Mapeamos los datos igual que hacés en obtenerTurnosPorEstado
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Resenia[];
  }

  async eliminarResenia(idResenia: string) {
    const reseniaRef = doc(this.firestore, 'resenias', idResenia);
    await deleteDoc(reseniaRef);
  }
}