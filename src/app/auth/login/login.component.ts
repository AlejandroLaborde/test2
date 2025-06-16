import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../auth.service';
import { AppStatusService } from '../../app-status.service';
import { Subscription, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../../home/shared/footer/footer.component';
import { environment } from '../../../environments/environment'
import { BootstrapTooltipDirective } from '../../core/directives/bootstrap-tooltip.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FooterComponent, BootstrapTooltipDirective, RouterModule],
  providers: [AuthService, AppStatusService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  currentDate: Date;
  dateTimer: any;

  version = environment.version;

  @ViewChild('changePasswordModal') changePasswordModal!: ElementRef;
  changePasswordModalRef: any;

  @ViewChild('passwordForgottenModal') passwordForgottenModal!: ElementRef;
  passwordForgottenModalRef: any;

  isGettingSchool: boolean = true;
  isGettingSchoolSubscription!: Subscription;

  loginForm: FormGroup = new FormGroup({
    // valida que tenga al menos tres caracteres
    dni: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  currentEyePassword = {
    password: 'fi-rr-eye-crossed',
    currentPassword: 'fi-rr-eye-crossed',
    newPassword: 'fi-rr-eye-crossed',
    confirmPassword: 'fi-rr-eye-crossed',
  }

  changePasswordFirstTimeForm: FormGroup = this.formBuilder.group({
    currentPassword: ['', [
      Validators.required,
    ]],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(10),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$'),
    ]],
    confirmPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(10),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$')
    ]],
  }, { validators: [this.passwordMatchValidator, this.lastPasswordMatchValidator] }, );
  changePasswordCounter: number = 0;
  changePasswordFirstTimeFormSubscription!: Subscription;
  showErrors: boolean = false;

  passwordForgottenForm = new FormGroup({
    dni: new FormControl(''),
  });

  lastPassword: string = '';

  asyncProccess: boolean = false;
  asyncProccessSubscription!: Subscription;

  // variable de estado que se va a usar solo para cambiar la password
  temporaryUserId: number = 0;

  color: string = '';
  imgURL: string = '';
  schoolName: string = '';

  routeToNavigate = ''

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private appStatusService: AppStatusService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.currentDate = new Date();
  }

  ngOnInit(): void {
      
    this.appStatusService.getSchoolPromise()

    // cuenta hasta 3 cambios en el formulario para mostrar los errores de validación
    // o campos requeridos
    this.changePasswordFirstTimeFormSubscription = this.changePasswordFirstTimeForm.valueChanges.subscribe({
      next: (value) => {
        this.changePasswordCounter++;
        if (this.changePasswordCounter > 9) {
          this.showErrors = true;
          this.changePasswordFirstTimeForm.markAllAsTouched();
        }
      }
    });

    this.isGettingSchoolSubscription = this.appStatusService.isGettingSchool().subscribe({
      next: (value) => {
        this.isGettingSchool = value;
        if (!value) {
          this.initApp();
        }
      },
      error: (err) => {
        this.isGettingSchool = true;
        this.toastr.error('Ocurrió un error inesperado', 'Error');
      },
      complete: () => {
        this.isGettingSchool = false;
      }
    });
  }

  initApp() {
    const changePasswordModal = document.getElementById('changePasswordModal')
    const myInput = document.getElementById('myInput')

    this.dateTimer = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    if (changePasswordModal) {
      changePasswordModal.addEventListener('shown.bs.modal', function () {
        if (myInput) {
          myInput.focus()
        }
      })
    }

    const passwordForgottenModal = document.getElementById('passwordForgottenModal')
    const passwordForgottenInput = document.getElementById('passwordForgottenInput')
    if(passwordForgottenModal) {
      passwordForgottenModal.addEventListener('shown.bs.modal', function() {
        if(passwordForgottenInput) {
          passwordForgottenInput.focus()
        }
      })
    }

    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';
    this.imgURL = localStorage.getItem('school') && JSON.parse(localStorage.getItem('school')!).logo ? JSON.parse(localStorage.getItem('school')!).logo : '/assets/img/athena.png';
    this.schoolName = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).nombre : '';

    this.asyncProccessSubscription = this.appStatusService.getAsyncProccess().subscribe({
      next: (value) => {
        this.asyncProccess = value;

        if (value) {
          this.loginForm.get('dni')?.disable();
          this.loginForm.get('password')?.disable();

          this.changePasswordFirstTimeForm.get('currentPassword')?.disable();
          this.changePasswordFirstTimeForm.get('newPassword')?.disable();
        } else {
          this.loginForm.get('dni')?.enable();
          this.loginForm.get('password')?.enable();

          this.changePasswordFirstTimeForm.get('currentPassword')?.enable();
          this.changePasswordFirstTimeForm.get('newPassword')?.enable();
        }
      },
      error: (err) => {
        this.asyncProccess = false;
      },
      complete: () => {
        this.asyncProccess = false;
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.dateTimer);
    this.asyncProccessSubscription.unsubscribe();
  }

  async onSubmit() {
    const dni = this.loginForm.get('dni')?.value;
    const password = this.loginForm.get('password')?.value;

    if (dni && password) {

      this.appStatusService.setAsync();
      /*  await this.delay(); */
      this.authService.login({ dni, password }).subscribe({
        next: (res) => {
          if (res?.firstTime) {
            // setea una variable de clase en inglés "id de usuario momentáneo"
            // con el id del usuario que se logueó
            this.temporaryUserId = res.id;
            this.changePasswordModalRef = this.getModal();
            this.changePasswordModalRef.show();
            this.lastPassword = password;
          } else {
              this.routeToNavigate = '/home/';
              this.appStatusService.setLoggedOut();
        
            // Trigger click on the hidden anchor element
            setTimeout(() => {
              const hiddenAnchor = document.getElementById('hiddenAnchor');
              if (hiddenAnchor) {
                hiddenAnchor.click();
              }
            }, 0);
          }
          this.appStatusService.unsetAsync();
        },
        error: (err) => {
          if (err.error.message) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            this.toastr.error('Ocurrió un error inesperado', 'Error');
          }
          this.appStatusService.unsetAsync();
        },
      });
    }
  }

  forgottenPassword(e: any) {
    e.preventDefault();
    this.passwordForgottenModalRef = this.getPasswordForgottenModal();
    this.passwordForgottenModalRef.show();
  }

  getModal() {
    var changePasswordModal = new bootstrap.Modal(this.changePasswordModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    return changePasswordModal;
  }

  getPasswordForgottenModal() {
    var passwordForgottenModal = new bootstrap.Modal(this.passwordForgottenModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    return passwordForgottenModal;
  }

  async submitNewPassword() {
    const currentPassword = this.changePasswordFirstTimeForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordFirstTimeForm.get('newPassword')?.value;
    const confirmPassword = this.changePasswordFirstTimeForm.get('confirmPassword')?.value;
    const id = this.temporaryUserId;

    if (newPassword === confirmPassword) {
      this.appStatusService.setAsync();
      this.authService.changePassword({ password: currentPassword, newPassword, id }).subscribe({
        next: res => {
          if (res) {
            this.changePasswordModalRef.hide();
            this.router.navigate(['/home']);
          }
        },
        error: err => {
          if (err.error.message) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            this.toastr.error('Ocurrió un error inesperado', 'Error');
          }
          this.appStatusService.unsetAsync();
        },
        complete: () => {
          this.appStatusService.unsetAsync();
        }
      }
      );
    }
  }

  passwordMatchValidator(control: AbstractControl) {
    const newPassword: string = control.get('newPassword')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ NoPassswordMatch: true });
    }
  }

  lastPasswordMatchValidator(control: AbstractControl) {
    const lastPassword: string = control.get('currentPassword')?.value;
    const newPassword: string = control.get('newPassword')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;
    if (newPassword.length > 0 && lastPassword === newPassword) {
      control.get('newPassword')?.setErrors({ LastPasswordMatch: true });
    }
    if(lastPassword.length > 0 && lastPassword === confirmPassword) {
      control.get('confirmPassword')?.setErrors({ LastPasswordMatch: true });
    }
  }

  submitPasswordForgotten () {
    const dni = this.passwordForgottenForm.get('dni')?.value;

    if (dni) {
      this.appStatusService.setAsync();
      this.authService.passwordForgotten({dni}).subscribe({
        next: res => {
          if (res) {
            this.passwordForgottenModalRef.hide();
            this.toastr.success('Se envió un correo con la nueva contraseña', '¡Listo!');
          }
        },
        error: err => {
          if (err.error.message) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            this.toastr.error('Ocurrió un error inesperado', 'Error');
          }
          this.appStatusService.unsetAsync();
        },
        complete: () => {
          this.appStatusService.unsetAsync();
        }
      });
    }
  }

  onCloseResetPasswordModal() {
    this.passwordForgottenModalRef.hide();
    this.passwordForgottenForm.reset();
  }

  togglePasswordVisibility(input:'password' | 'currentPassword' | 'newPassword' | 'confirmPassword') {
    const passwordInput = document.getElementById(input) as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      this.currentEyePassword[input] = 'fi-rr-eye'
    } else {
      this.currentEyePassword[input] = 'fi-rr-eye-crossed'
      passwordInput.type = 'password';
    }
  }

  cancelChangePassword () {
    this.authService.logout();
    this.changePasswordModalRef.hide();
    this.changePasswordModalRef = null;
  }
}
