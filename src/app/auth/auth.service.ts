import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { LoginData, LoginResponse } from '../interfaces/session.interface';
import { Router } from '@angular/router';
import ls from 'localstorage-slim';
import { ToastrService } from 'ngx-toastr';
import { GetUserToResetPasswordDTO } from '../interfaces/reset-password.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggeed = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) { }

  login(credentials: { dni: string, password: string }): Observable<LoginData | null> {

    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, credentials).pipe(
      map((res: any) => {
        if (res.body.token) {
          const token = res.body.token;
          const decodedToken: LoginData = jwtDecode(token);

          console.log('decodedToken', decodedToken);

          localStorage.setItem('token', token);

          localStorage.setItem('name', decodedToken.name);

          localStorage.setItem('lastName', decodedToken.lastName);

          localStorage.setItem('email', decodedToken.email);

          localStorage.setItem('exp', decodedToken.exp.toString());

          localStorage.setItem('photo', decodedToken.photo || '');

          ls.set('modules', decodedToken.modules, { encrypt: true });

          ls.set('role', decodedToken.role, { encrypt: true });

          ls.set('dni', decodedToken.dni, { encrypt: true });

          if(decodedToken.role.name === 'Alumno') {
            localStorage.setItem('course', decodedToken.course || '');
          }

          localStorage.setItem('id', decodedToken.id.toString());

          this.setLoggedUser();


          return decodedToken;
        }
        return null;
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('lastName');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('exp');
    localStorage.removeItem('modules');
    localStorage.removeItem('role');
    localStorage.removeItem('dni');
    this.setLoggedOut();

    this.router.navigate(['/login']);
  }

  changePassword(credentials: { password: string, newPassword: string, id: number }): Observable<LoginData | null> {
    return this.http.put<LoginResponse>(`${environment.apiUrl}/updatePassword`, credentials).pipe(
      map((res: any) => {
        if (res.body.token) {
          const token = res.body.token;
          const decodedToken: LoginData = jwtDecode(token);

          localStorage.removeItem('token');
          localStorage.setItem('token', token);

          localStorage.removeItem('name');
          localStorage.setItem('name', decodedToken.name);

          localStorage.removeItem('lastName');
          localStorage.setItem('lastName', decodedToken.lastName);

          localStorage.removeItem('exp');
          localStorage.setItem('id', decodedToken.id.toString());

          localStorage.removeItem('email');
          localStorage.setItem('email', decodedToken.email);

          localStorage.removeItem('modules');
          ls.set('modules', decodedToken.modules, { encrypt: true });

          localStorage.removeItem('role');
          ls.set('role', decodedToken.role, { encrypt: true });

          localStorage.removeItem('dni');
          ls.set('dni', decodedToken.dni, { encrypt: true });

          return decodedToken;
        }
        return null;
      })
    );
  }

  resetPassword(dni: string): Observable<any> | void {
    const modules: { description: string; id: number; name: string; permission: "E" | "L" }[] = ls.get('modules', { decrypt: true }) || [];
    if (!modules.find(m => m.name === 'reset-password')) {
      this.toastr.error('No tienes permisos para realizar esta acción');
      return;
    }
    return this.http.post(`${environment.apiUrl}/reset-password`, { dni });
  }

  getUserToResetPassword(dni: string): Observable<GetUserToResetPasswordDTO | null> {
    return this.http.get<GetUserToResetPasswordDTO>(`${environment.apiUrl}/reset-password?dni=${dni}`);
  }

  passwordForgotten(credentials: { dni: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgotpassword`, credentials);
  }

  getLoggedUser() {
    return this.isLoggeed
  }

  setLoggedUser() {
    this.isLoggeed.set(true);
  }

  setLoggedOut() {
    this.isLoggeed.set(false);
  }

  getRole():{id:number, name:string} | null {
    const role:{id:number, name:string}|null = ls.get('role', { decrypt: true });
    return role;
  }

  getSignature(): Observable<{ body: { firma: string } }> {
    return this.http.get<{ body: { firma: string } }>(`${environment.apiUrl}/my-signature`);
  }

  getSignatureByID(id: number): Observable<{ body: { firma: string } }> {
    return this.http.get<{ body: { firma: string } }>(`${environment.apiUrl}/signature/${id}`);
  }

}
