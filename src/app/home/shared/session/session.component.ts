import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../auth/auth.service';
import ls from 'localstorage-slim';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent implements OnInit, OnDestroy {
  currentDate: Date;

  color: string = ''
  fullName: string = '';
  mail: string = 'mail@example.com';
  role: string = '';
  course: string = 'Curso';
  dni: string = '';
  photo: string|null = null;
  dateTimer: any;
  showCourse: boolean = false;

  constructor(
    private authService: AuthService
  ) {
    this.currentDate = new Date();
  }

  ngOnInit() {
    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';
    
    const roleValue:any = ls.get('role', {decrypt: true});
    this.role = roleValue.name;
    
    this.fullName = localStorage.getItem('name') + ' ' + localStorage.getItem('lastName');

    const dniValue:any = ls.get('dni', {decrypt: true});
    this.dni = dniValue;

    this.mail = localStorage.getItem('email') || ''

    this.photo = localStorage.getItem('photo') || 'assets/img/blank-profile.webp';

    this.showCourse = this.role == 'Alumno';

    if(this.showCourse) {
      this.course = localStorage.getItem('course') || 'No definido';
    }

    this.dateTimer = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.dateTimer);
  }

  logout() {
    this.authService.logout();
  }
}
