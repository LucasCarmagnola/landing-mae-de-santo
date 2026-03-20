import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  // Inyectamos la conexión a la base de datos que configuramos antes
  private firestore = inject(Firestore);

  async guardarTurno(datosTurno: any) {
    try {
      // 1. Apuntamos a la "carpeta" (colección) llamada 'turnos' en Firebase
      const turnosRef = collection(this.firestore, 'turnos');
      
      // 2. Le sumamos a los datos del cliente nuestra info de control interno
      const turnoCompleto = {
        ...datosTurno,
        estado: 'pendiente', // Fundamental para nuestra regla de las 2 horas
        fechaCreacion: serverTimestamp() // Hora oficial del servidor de Google (infalsificable)
      };

      // 3. ¡Disparamos a la nube!
      const docRef = await addDoc(turnosRef, turnoCompleto);
      console.log('Turno guardado con éxito. ID:', docRef.id);
      
      return docRef.id; // Devolvemos el ID único por si sirve después
    } catch (error) {
      console.error('Error al guardar el turno en Firebase:', error);
      throw error; // Lanzamos el error para atajarlo en el componente
    }
  }

  async obtenerTurnosOcupados(fechaArgentina: string): Promise<string[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    
    // Filtramos: Traeme los turnos de esta fecha exacta
    const q = query(turnosRef, where('fechaArgentina', '==', fechaArgentina));
    
    const querySnapshot = await getDocs(q);
    const horariosOcupados: string[] = [];
    
    querySnapshot.forEach((doc) => {
      // Guardamos en la lista las horas base que ya están reservadas
      horariosOcupados.push(doc.data()['horaArgentina']);
    });
    
    return horariosOcupados;
  }

  async obtenerTurnosPorEstado(estado: string) {
    const turnosRef = collection(this.firestore, 'turnos');
    // Buscamos los turnos con ese estado
    const q = query(turnosRef, where('estado', '==', estado));
    
    const snapshot = await getDocs(q);
    
    // Mapeamos los datos y les agregamos el ID único del documento (clave para poder modificarlos después)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Actualiza el estado a "confirmado"
  async confirmarTurno(idTurno: string) {
    const turnoRef = doc(this.firestore, 'turnos', idTurno);
    await updateDoc(turnoRef, { estado: 'confirmado' });
  }

  // Elimina el turno si no mandaron el comprobante
  async eliminarTurno(idTurno: string) {
    const turnoRef = doc(this.firestore, 'turnos', idTurno);
    await deleteDoc(turnoRef);
  }
  

}