import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppStatusService } from '../../../app-status.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PreceptorService } from '../../services/preceptor.service';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { CalendarModule } from 'primeng/calendar';
import { PrimeNGConfig } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BootstrapTooltipDirective } from '../../../core/directives/bootstrap-tooltip.directive';

@Component({
  selector: 'app-manage-assistance',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, BootstrapTooltipDirective],
  templateUrl: './manage-assistance.component.html',
  styleUrl: './manage-assistance.component.scss'
})
export class ManageAssistanceComponent implements OnInit, AfterViewInit {

  justified: string = 'mp';

  es: any;

  assistanceDescription: string[] = ['', 'PRESENTE', 'AUSENTE', 'TARDE', 'AUSENTE CON PRESENCIA']

  @ViewChild('modifAssistanceModal') modifAssistanceModal!: ElementRef;
  modifAssistanceModalRef: any;

  @ViewChild('feriadosModal') feriadosModal!: ElementRef;
  feriadosModalRef: any;

  @ViewChild('confirmFeriadosModal')
  confirmFeriadosModal!: ElementRef;
  confirmFeriadosModalRef: any;

  currentCourseName: string = '';

  allCourses = false;

  currentQuarter: number = 0;
  selectedQuarter: number = 0;

  date: Date;
  disabledDates: Date[] = [];
  cantTakeAssistance: boolean = false;

  currStudentAssistance: {
    id: number,
    name: string,
    assistance: number,
    originalAssistance: number
    originalJustified: boolean
    originalJustDescription: string
  } | null = null;
  currStudentAssistanceSubscription!: Subscription;

  color: string = '';

  asyncProccess = true;
  asyncProccessSubscription!: Subscription;

  courses: {
    id: number,
    name: string,
    isMine?: boolean
  }[] = [];
  getCoursesSubscription!: Subscription;

  courseAssistance: {
    id: number,
    name: string,
    students: {
      id: number,
      name: string,
      assistance: number
    }[]
  } | null = null;
  courseAssistanceSubscription!: Subscription;

  dates: string[] = [];
  holidaysDescription: string = '';

  courseAssistanceByDate: {
    id: number;
    date: string;
    students: {
      id: number;
      name: string;
      assistance: number;
      isJust: boolean | null;
      obsJust: string | null;
    }[];
  } | null = null;
  courseAssistanceByDateSubscription!: Subscription;

  assistance: boolean = false;
  modification: boolean = false;
  lastModificationsLabel: boolean = false;

  selectedDate: string = '';

  descriptionText: string = '';
  justDescriptionText: string = '';

  courseAssistanceByQuarter: {
    course: string,
    date: string,
    dateModification: string,
    assistance: number,
    observation: string,
    student: string,
    preceptor: string
  }[] | null = null;
  courseAssistanceByQuarterSubscription!: Subscription;
  currentCourseID: number = 0;

  isDirective: boolean = false;


  constructor(
    private appStatusService: AppStatusService,
    private preceptorService: PreceptorService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private primengConfig: PrimeNGConfig
  ) { 
    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);
  }

  ngOnInit(): void {

    this.primengConfig.setTranslation({
      accept: 'Accept',
      reject: 'Cancel',
      //translations
      monthNames: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ],
      dayNamesShort: [
        'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'
      ],
    });

    const allCourses = this.router.url.split('/')[2] == 'all-courses';

    this.allCourses = allCourses;

    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';

    this.isDirective = this.authService.getRole()?.id == 5;

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
    this.appStatusService.setAsync();
    const coursesObservable = allCourses ? this.preceptorService.getAllCoursesWithoutRegardlessOfPreceptor() : this.preceptorService.getAllMyCourses();
    const nonWDObservable = this.preceptorService.getNonWorkingDates();


    forkJoin([coursesObservable, nonWDObservable]).subscribe({
      next: ([courses, nonWD]) => {
        this.courses = courses.courses;
        this.currentQuarter = courses.currentQuarter;
        this.selectedQuarter = this.currentQuarter;
        if (courses.courses.length === 0) {
          this.toastr.info('No hay cursos', 'Info');
        };

        this.disabledDates = nonWD.map((date: { date: string; description: string }) => {
          const [year, month, day] = date.date.split('-').map(Number);
          const adjustedDate = new Date(year, month - 1, day);
          adjustedDate.setHours(0, 0, 0, 0);
          return adjustedDate;
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.cantTakeAssistance = this.disabledDates.some(date => date.toISOString().split('T')[0] === today.toISOString().split('T')[0]);

        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al cargar los cursos', 'Error');
        this.appStatusService.unsetAsync();
      },
    });



    this.getCoursesSubscription = coursesObservable.subscribe()
  }

  ngAfterViewInit() {
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getAssistance(id: number) {
    this.appStatusService.setAsync();
    this.courseAssistanceSubscription = this.preceptorService.getCurrentCourseAssistance(id, 4).subscribe({
      next: (courseAssistance) => {
        this.currentCourseName = this.courses.find(course => course.id === id)!.name;
        this.courseAssistance = courseAssistance;
        this.assistance = true;
        if (courseAssistance.students.length === 0) {
          this.toastr.info('No hay asistencias para esta fecha', 'Info');
        } else {
        }
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al cargar las asistencias', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
    this.assistance = true;
    this.appStatusService.unsetAsync();
  }

  modifAssistance(id: number, date: string = new Date().toISOString().split('T')[0]) {
    this.appStatusService.setAsync();
    this.courseAssistanceByDateSubscription = this.preceptorService.getCourseAssistanceByDate(id, date).subscribe({
      next: (courseAssistanceByDate) => {
        this.courseAssistanceByDate = courseAssistanceByDate;
        this.currentCourseName = this.courses.find(course => course.id === id)!.name;
        this.selectedDate = date;
        this.modification = true;
        if (courseAssistanceByDate.students.length === 0) {
          this.toastr.info('No hay asistencias para esta fecha', 'Info');
        } else {
        }
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al cargar las asistencias', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
    this.appStatusService.unsetAsync();
  }



  lastModifications(id: number) {
    this.currentCourseID = id;
    this.appStatusService.setAsync();
    this.courseAssistanceByQuarterSubscription = this.preceptorService.getLastModificationsFromCourseAndQuarter(id, this.selectedQuarter).subscribe({
      next: (courseAssistanceByQuarter) => {
        this.currentCourseName = this.courses.find(course => course.id === id)!.name;
        this.courseAssistanceByQuarter = courseAssistanceByQuarter;
        this.lastModificationsLabel = true;
        if (courseAssistanceByQuarter.length === 0) {
          this.toastr.info('No hay modificaciones en este trimestre o corriente año', 'Info');
        } else {
        }
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.courseAssistanceByQuarter = [];
        this.lastModificationsLabel = true;
        this.toastr.error('Error al cargar las últimas modificaciones', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
  }

  onDateChange(event: any) {
    this.modifAssistance(this.courseAssistanceByDate?.id || 0, event);
  }

  setAssistance(id: number, assistance: number) {
    this.appStatusService.setAsync();

    const assistanceToInsert = {
      preceptorID: 4,
      assistance: assistance,
      courseID: this.courseAssistance?.id || 0,
      studentID: id
    }

    this.preceptorService.setAssistance(assistanceToInsert).subscribe({
      next: (response) => {
        const student = this.courseAssistance?.students.find(student => student.id === id);
        if (student) {
          student.assistance = assistance;
        }
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al actualizar la asistencia', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
  }

  getModifAssistanceModal() {
    var modifAssistanceModal = new bootstrap.Modal(this.modifAssistanceModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.modifAssistanceModalRef = modifAssistanceModal;
    this.modifAssistanceModalRef.show();
  }

  closeModifAssistanceModal() {
    this.modifAssistanceModalRef.hide();
  }

  modifStudentAssistance(id: number) {
    const student = this.courseAssistanceByDate?.students.find(student => student.id === id);
    if (student) {
      this.currStudentAssistance = {
        id: student.id,
        name: student.name,
        assistance: student.assistance,
        originalAssistance: student.assistance,
        originalJustified: student.isJust || false,
        originalJustDescription: student.obsJust || ''
      };

      if (student.isJust) {
        this.justified = 'yes';
        this.justDescriptionText = student.obsJust || '';
      } else {
        this.justified = 'no';
        this.justDescriptionText = '';
      }
      this.getModifAssistanceModal();
    }
  }

  setCurrStudentAssistanceAssistance(assistance: number) {
    if (this.currStudentAssistance) {
      this.currStudentAssistance.assistance = assistance;
    }
  }

  openHolidaysModal() {
    var feriadosModal = new bootstrap.Modal(this.feriadosModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.feriadosModalRef = feriadosModal;
    this.feriadosModalRef.show();
  }

  closeHolidaysModal() {
    this.feriadosModalRef.hide();
  }

  confirmModifStudentAssistance() {
    this.appStatusService.setAsync();
    if (this.currStudentAssistance) {
      const assistanceID = this.currStudentAssistance.assistance;
      this.currStudentAssistanceSubscription = this.preceptorService.updateAssistance({
        assistance: assistanceID,
        courseID: this.courseAssistanceByDate?.id || 0,
        studentID: this.currStudentAssistance.id,
        obs: this.descriptionText,
        date: this.selectedDate,
        isJustified: assistanceID == 2 ? (this.justified === 'yes' ? true : false) : null,
        obsJust: assistanceID == 2 && this.justified === 'yes' ? this.justDescriptionText : null
      }).subscribe({
        next: (response) => {
          this.descriptionText = '';
          const student = this.courseAssistanceByDate?.students.find(student => student.id === this.currStudentAssistance?.id);
          if (student) {
            student.assistance = this.currStudentAssistance && assistanceID || 0;
          }
          this.currStudentAssistance = null;
          this.closeModifAssistanceModal();
          this.appStatusService.unsetAsync();
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Error al actualizar la asistencia', 'Error');
          this.appStatusService.unsetAsync();
        }
      })
    }
  }

  closeModifStudentAssistance() {
    this.closeModifAssistanceModal();
    this.currStudentAssistance = null
  }

  getConfirmHolidayModal() {

    this.closeHolidaysModal();

    var confirmFeriadosModal = new bootstrap.Modal(this.confirmFeriadosModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.confirmFeriadosModalRef = confirmFeriadosModal;
    this.confirmFeriadosModalRef.show();
  }

  closeConfirmHolidayModal() {
    this.confirmFeriadosModalRef.hide();
  }

  shouldDisableConfirmButton(): boolean {
    if (this.descriptionText.length < 5) return true;

    if (this.currStudentAssistance?.originalAssistance !== 2) {
      // si curr assistance es 2 debe validar que si está justificada la asistencia, la descripción tenga al menos 5 caracteres
      if (this.currStudentAssistance?.assistance == 2 && this.justified === 'yes' && this.justDescriptionText.length > 5) return false;
      if (this.currStudentAssistance?.assistance == 2 && this.justified == 'no') return false;
      else return !(this.currStudentAssistance?.assistance != 2 && this.currStudentAssistance?.assistance != this.currStudentAssistance?.originalAssistance);
    }

    else {
      if (this.currStudentAssistance?.assistance !== this.currStudentAssistance?.originalAssistance) {
        return false;
      }

      if (this.currStudentAssistance?.originalJustified ? !(this.justified == 'yes') : !(this.justified == 'no')) {
        if (this.justified === 'no') {
          return false;
        }
      }

      if (this.justified === 'yes' && (this.currStudentAssistance?.originalJustDescription !== this.justDescriptionText && this.justDescriptionText.length > 5)) {
        return false;
      }

    }

    return true;
  }

  confirmHolidayModal() {
    this.appStatusService.setAsync();
    this.date.setHours(0, 0, 0, 0);
    this.preceptorService.postNonWorkingDates({
      date: this.date.toISOString().split('T')[0],
      description: this.holidaysDescription
    }).subscribe({
      next: (response) => {
        this.holidaysDescription = '';
        const currDisabledDates = [...this.disabledDates];
        this.disabledDates = [];
        this.disabledDates = [...currDisabledDates, this.date];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if(this.disabledDates.some(date => date.toISOString().split('T')[0] === today.toISOString().split('T')[0])) {
          this.cantTakeAssistance = true;
        }
        this.closeConfirmHolidayModal();
        this.toastr.success('Feriado agregado', 'Éxito');
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al agregar el feriado', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
  }

  isDateOnDisabledDates(): boolean {
    return this.disabledDates.some(disabledDate => disabledDate.toISOString().split('T')[0] === this.date.toISOString().split('T')[0]);
  }

  getStatusColor(status: number|undefined): string {
    if(status) {
      switch (status) {
        case 1:
          return '#198754'; // PRESENTE
        case 2:
          return '#dc3545'; // AUSENTE
        case 3:
          return '#ffc107'; // TARDE
        case 4:
          return '#0d6efd'; // AUSENTE CON PRESENCIA
        default:
          return '#000000'; // Color por defecto
      }
    } else {
      return '#000000'; // Color por defecto
    }
  }

}
