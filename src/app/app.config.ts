import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAaCb1hOW5b-ujwgIOL98ByhAoqMlz4sdQ",
  authDomain: "mae-de-santo.firebaseapp.com",
  projectId: "mae-de-santo",
  storageBucket: "mae-de-santo.firebasestorage.app",
  messagingSenderId: "861695875811",
  appId: "1:861695875811:web:d989ec279b21a7de52c3d6",
  measurementId: "G-3DTHXC5VE7"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
