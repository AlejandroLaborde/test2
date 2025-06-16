import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../environments/environment'
import { HttpClient } from '@angular/common/http';
import { GetInitialSchoolResponse } from './interfaces/response.interface';
import { DecodedToken } from './interfaces/session.interface';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth/auth.service';
import ls from 'localstorage-slim';

@Injectable({
  providedIn: 'root'
})
export class AppStatusService implements OnInit {

  initialSchool: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  asyncProccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  expiresIn: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private authService: AuthService
  ) {

  }

  schoolColor: string = '';

  ngOnInit() {

  }

  // este método retorna un observable de tipo boolean
  // que indica si hay un proceso asíncrono en curso
  getAsyncProccess() {
    return this.asyncProccess.asObservable();
  }

  // este método setea el valor del observable asyncProccess
  // en true
  setAsync() {
    this.asyncProccess.next(true);
  }

  // este método setea el valor del observable asyncProccess
  // en false
  unsetAsync() {
    this.asyncProccess.next(false);
  }


  //necesito crear un método que devuelva una promesa, no un observable, que se resuelva cuando getSchool
  //termine de ejecutarse, para poder usarlo en app.component.ts
  getSchoolPromise() {
    const school = this.http.get<GetInitialSchoolResponse>(`${environment.apiUrl}/school`);

    school.subscribe({
      next: (value) => {
        if (value.status === 'ok') {
          if (value.body) {
            localStorage.setItem('school', JSON.stringify(value.body.school));
            
            localStorage.setItem('mail', value.body.social.mail);
            localStorage.setItem('web', value.body.social.web);
            localStorage.setItem('wpp', value.body.social.wpp);
            localStorage.setItem('ig', value.body.social.ig);
            localStorage.setItem('in', value.body.social.in);
            
            this.initialSchool.next(false);
          }
        }
      },
      error: (error) => {
        console.log(error)
        this.toastr.error('Error al obtener la escuela', 'Error')
      }
    });
  }



  isGettingSchool() {
    return this.initialSchool.asObservable();
  }

  setGettingSchoolFalse() {
    this.initialSchool.next(false);
  }

  getSchoolColor() {
    const school = localStorage.getItem('school');
    if (school) {
      const schoolObject = JSON.parse(school);
      return schoolObject.color;
    }
  }

  // si el token existe y no ha expirado retorna true
  // en caso contrario retorna false
  isLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      if (decodedToken.firstTime === 1) return false;
      const expires = decodedToken.exp;
      const now = new Date().getTime();
      if (Number(expires) * 1000 < now) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('lastName');
        localStorage.removeItem('id');
        return false;
      }

      return true;
    }

    return false;
  }

  setLoggedOut() {

    const expires = Number(ls.get('exp', {decrypt: true}));

    // debe obtener la diferencia en milisegundos
    // entre la fecha de expiración y la fecha actual

    const now = new Date().getTime();
    const diff = (expires * 1000) - now;

    this.expiresIn = setTimeout(() => {
      this.authService.logout();
      this.toastr.info('Sesión expirada', 'Info', {
        disableTimeOut: true
      });
    }, diff);
  }

  setLoggedUser() {
    this.authService.setLoggedUser();
  }

  getLoggedUser() {
    return this.authService.getLoggedUser();
  }

  setLoggedOutUser() {
    this.authService.setLoggedOut();
  }


}
