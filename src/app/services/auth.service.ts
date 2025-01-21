import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(null);
  private initialized = false;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  async initStorage() {
    if (!this.initialized) {
      await this.storage.create();
      const token = await this.storage.get('token');
      if (token) {
        this.token$.next(token);
      }
      this.initialized = true;
    }
    return this.token$.value;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, credentials).pipe(
      tap(async (response: any) => {
        if (response.token) {
          await this.storage.set('token', response.token);
          this.token$.next(response.token);
        }
      })
    );
  }

  async logout() {
    try {
      await this.http.post(`${environment.apiUrl}/logout`, {}).toPromise();
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    }
    await this.storage.remove('token');
    this.token$.next(null);
  }

  getToken(): string | null {
    return this.token$.value;
  }

  isAuthenticated(): boolean {
    return !!this.token$.value;
  }

  // Novo método para verificar o token
  checkAuth(): Observable<boolean> {
    return from(this.initStorage()).pipe(
      map(token => !!token)
    );
  }
}