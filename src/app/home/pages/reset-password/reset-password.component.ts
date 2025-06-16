import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import ls from 'localstorage-slim';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { AppStatusService } from '../../../app-status.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  @ViewChild('resetPasswordModal') resetPasswordModal!: ElementRef;
  resetPasswordModalRef: any;

  resetPasswordForm = new FormGroup({
    dni: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
      Validators.maxLength(8),
      // valida que solo sean números
      Validators.pattern('^[0-9]*$')
    ]),
  });
  resetPasswordChangeSubscription!: Subscription;
  showErrors = false;

  description = '';
  color = ''

  asyncProccess = false;
  asyncProccessSubscription!: Subscription;

  username:string = '';
  userlastname:string = '';

  constructor(
    private router: Router,
    private appStatusService: AppStatusService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  // el ngOnInit se encarga de obtener el módulo actual y su descripción para mostrarla en la vista
  ngOnInit(): void {

    this.asyncProccessSubscription = this.appStatusService.getAsyncProccess().subscribe({
      next: (value) => {
        this.asyncProccess = value;
      },
      error: (err) => {
        this.asyncProccess = false;
      },
      complete: () => {
        this.asyncProccess = false;
      }
    })

    const modules: {description:string; id:number; name:string; permission: "E" | "L"}[] = ls.get('modules', { decrypt: true }) || [];
    const currentRoute = this.router.url.split('/')[1];
    const description = modules && modules.find(m => m.name === currentRoute)?.description || 'Reseteo de contraseña';
    this.description = description;

    const school = localStorage.getItem('school');
    if(school) {
      this.color = JSON.parse(school).color;
    }

    this.resetPasswordChangeSubscription = this.resetPasswordForm.valueChanges.subscribe({
      next: (value)=> {
        if(value && value.dni) {
          // valida que el dni contenga una letra en cualquier lugar, incluso desde la posición 0
          if(/^[0-9]*[a-zA-Z][0-9]*$/.test(value.dni)) {
            this.showErrors = true;
          }
        }
        if(value && value.dni && value.dni.length == 7) {
          this.showErrors = true;
        }
      }
    });
  }

  submitResetPassword() {
    const dni:string = this.resetPasswordForm.value.dni!;
    this.appStatusService.setAsync();
    this.authService.getUserToResetPassword(dni).subscribe({
      next: (value) => {
        if(value) {
          this.username = value && value.body && value.body.name || '';
          this.userlastname = value && value.body && value.body.lastName || '';
        }
        this.getResetPasswordModal();
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        this.toastr.error(err.error.message, 'Error')
        this.appStatusService.unsetAsync();
      },
      complete: () => {
        this.appStatusService.unsetAsync();
      }
    });
  }

  confirmResetPassword() {
    const dni:string = this.resetPasswordForm.value.dni!;
    this.appStatusService.setAsync();
    this.authService.resetPassword(dni)?.subscribe({
      next: (value) => {
        this.toastr.success('Contraseña reseteada con éxito', 'Éxito');
        this.showErrors = false;
        this.resetPasswordForm.reset();
        this.closeResetPasswordModal();
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        this.toastr.error(err.error.message, 'Error')
        this.appStatusService.unsetAsync();
        this.closeResetPasswordModal();
      },
      complete: () => {
        this.appStatusService.unsetAsync();
        this.closeResetPasswordModal();
      }
    });
  }

  getResetPasswordModal() {
    var resetPasswordModal = new bootstrap.Modal(this.resetPasswordModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    
    this.resetPasswordModalRef = resetPasswordModal;
    this.resetPasswordModalRef.show();
  }

  closeResetPasswordModal() {
    this.resetPasswordModalRef.hide();
  }

}
