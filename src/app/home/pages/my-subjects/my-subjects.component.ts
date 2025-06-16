import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStatusService } from '../../../app-status.service';
import { StudentService } from '../../services/student.service';
import { Chart, ChartConfiguration, ChartType, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthService } from '../../../auth/auth.service';
import { PreceptorService } from '../../services/preceptor.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { BootstrapTooltipDirective } from '../../../core/directives/bootstrap-tooltip.directive';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

Chart.register(PieController, ArcElement, Tooltip, Legend);

interface SubjectsArr {
  schoolSubjectID: number;
  name: string;
  teacher: string;
  days: {
    sunday: string, monday: string, tuesday: string, wednesday: string, thursday: string, friday: string, saturday: string
  };
}

interface SubjectDetailTeacher { name: string; teacher: string; quarter: number; classes: number; absences: number; days: { [key: string]: string }; absencesDetails: StudentAbsenceDetail[]; }// Objeto con claves como días y valores como horarios quarter: number; classes: number; absences: number; absencesDetails: StudentAbsenceDetail[]; 

interface StudentAbsenceDetail {
  date: string;
  name: string;
  lastName: string;
  a: number;
  t: number;
  ap: number;
  p: number;
  numberOfRemainingAbsences: number;
}// Observación podría ser agregada aquí como un string opcional si se planea usar en el futuro name:string; lastName:string; a: number; t:number; ap:number; p:number; numberOfRemainingAbsences:number; justified:number;

@Component({
  selector: 'app-my-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, BootstrapTooltipDirective],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss'
})
export class MySubjectsComponent implements OnInit {
  asyncProccess = true;
  asyncProccessSubscription!: Subscription;

  justified: string = 'mp';

  color: string = '';

  subjects: any[] = [];

  today: Date = new Date();

  courseAssistanceSubjectName: string = '';

  getAllBujectsSubscription!: Subscription;

  assistanceDescription: string[] = ['', 'PRESENTE', 'AUSENTE', 'TARDE', 'AUSENTE CON PRESENCIA']

  subjectDetail: any | null = null;
  subjectDetailSubscription!: Subscription;

  isTeacher: boolean = false;

  descriptionText: string = '';
  justDescriptionText: string = '';
  currentSchoolSubjectName: string = '';

  @ViewChild('chartCanvas') chartContainer!: ElementRef;

  @ViewChild('modifAssistanceModal') modifAssistanceModal!: ElementRef;
  modifAssistanceModalRef: any;
  selectedQuarter: number = 0;
  currentCourseID: number = 0;

  isNan = isNaN;

  objectKeys = Object.keys;

  cantTakeAssistance: boolean = false;

  subjectDetailTeacherSubscription!: Subscription;
  subjectDetailTeacher: SubjectDetailTeacher | null = null;

  courseAssistanceSubscription!: Subscription;
  currentCourseName: string = '';

  selectedDate: string = '';

  courseAssistanceByDate: {
    id: number;
    date: string;
    schoolSubjectID?: number,
    schoolSubjectGroupID?: number,
    groupID?: number,
    schoolSubjectName?: string,
    students: {
      id: number;
      name: string;
      assistance: number;
      isJust: boolean | null;
      obsJust: string | null;
    }[];
  } | null = null;
  courseAssistanceByDateSubscription!: Subscription;

  currStudentAssistance: {
    id: number,
    name: string,
    assistance: number,
    originalAssistance: number
    originalJustified: boolean
    originalJustDescription: string;
  } | null = null;
  currStudentAssistanceSubscription!: Subscription;

  courseAssistance: {
    id: number;
    name: string;
    schoolSubjectID?: number,
    groupID?: number,
    students: {
      id: number;
      name: string;
      assistance: number;
      file?: string;
      profilePic?: string | null;
      sex: string|null;
      tel: string|null;
      mail: string|null;
    }[];
  } | null = null;

  studentAssistanceDetail: {
    id: number,
    name: string,
    assistance: number,
    file?: string,
    profilePic?: string | null
    sex: string|null;
    tel: string|null;
    mail: string|null;
  } | null = null;

  signatureURL: SafeUrl | null = null;

  constructor(
    private appStatusService: AppStatusService,
    private studentService: StudentService,
    private authService: AuthService,
    private preceptorService: PreceptorService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {

    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';

    this.isTeacher = this.authService.getRole()?.id == 3;

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

    if (this.isTeacher) {
      const nonWDObservable = this.preceptorService.getNonWorkingDates();
      nonWDObservable.subscribe({
        next: (res) => {
          this.cantTakeAssistance = res.some(d => {
            const [year, month, day] = d.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            date.setHours(0, 0, 0, 0);

            const today = new Date()
            today.setHours(0, 0, 0, 0);

            return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
          })
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else { }

    this.getAllBujectsSubscription = this.studentService.getAllMySubjects().subscribe({
      next: (res: any) => {
        this.subjects = res;
        this.appStatusService.unsetAsync();
      },
      error: (err: any) => {
        this.appStatusService.unsetAsync();
      }
    });
  }

  getSignatureByTeacherID(teacherID: number) {
    this.appStatusService.setAsync();
    this.authService.getSignatureByID(teacherID).subscribe({
      next: (res) => {
        const base64Image = res.body.firma;
        this.signatureURL = this.convertBase64ToBlobUrl(base64Image);
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        this.signatureURL = null;
        this.toastr.error('Error al cargar la firma', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
  }

  takeCourseAssistance(subjectID: number, schoolSubjectName: string) {

    this.currentSchoolSubjectName = schoolSubjectName;

    this.courseAssistanceSubscription = this.preceptorService.getCurrentCourseAssistance(subjectID, 3).subscribe({
      next: (courseAssistance) => {
        this.currentCourseName = courseAssistance.name
        this.courseAssistance = courseAssistance;
        this.currentSchoolSubjectName = courseAssistance.schoolSubjectName || '';
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
  }

  modifAssistance(subjectID: number, date: string = new Date().toISOString().split('T')[0]) {
    this.appStatusService.setAsync();

    // verifica que date sea la fecha de hoy, un IF
    if (date === new Date().toISOString().split('T')[0]) {
      this.selectedDate = date;
    }

    this.courseAssistanceByDateSubscription = this.preceptorService.getCourseAssistanceByDateAndSchoolSubjectID({
      date,
      schoolSubjectID: subjectID
    }).subscribe({
      next: (courseAssistanceByDate) => {
        this.courseAssistanceByDate = courseAssistanceByDate;
        this.currentCourseName = courseAssistanceByDate.name;
        this.currentSchoolSubjectName = courseAssistanceByDate.schoolSubjectName || '';
        this.appStatusService.unsetAsync();

        if (courseAssistanceByDate.students.length === 0) {
          this.toastr.info('No hay asistencias para esta fecha', 'Info');
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Error al cargar las asistencias', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
  }

  onDateChange(event: any) {
    this.modifAssistance(this.courseAssistanceByDate?.schoolSubjectGroupID || 0, event);
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
        originalJustDescription: student.obsJust || '',
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

  getModifAssistanceModal() {
    var modifAssistanceModal = new bootstrap.Modal(this.modifAssistanceModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.modifAssistanceModalRef = modifAssistanceModal;
    this.modifAssistanceModalRef.show();
  }

  lastModifications(subjectID: number) {
    this.currentCourseID = subjectID;
  }

  getSubjectDetail(subjectID: number, fromA?: boolean) {
    this.currentCourseID = subjectID;

    if (this.isTeacher) {
      if (fromA) return;

      this.appStatusService.setAsync();

      this.subjectDetailTeacherSubscription = this.studentService.getCourseSubjectAssistance(subjectID, this.selectedQuarter).subscribe({
        next: (res) => {

          this.subjectDetailTeacher = res;
          this.appStatusService.unsetAsync();
        },
        error: (err) => {
          this.appStatusService.unsetAsync();
          this.toastr.error('Error al cargar las asistencias', 'Error');
        }
      });
    } else {
      this.appStatusService.setAsync();

      const teacherID = this.subjects.find(subject => subject.schoolSubjectID === subjectID)?.teacherID || 0;

      this.subjectDetailSubscription = this.studentService.getMySubjectsDetails(subjectID).subscribe({
        next: (res: any) => {
          this.subjectDetail = res;
          const data = {
            labels: ['Asistencia', 'Ausencias'],
            datasets: [{
              label: 'Cantidad',
              data: [res.classes - res.absences, res.absences],
              backgroundColor: [
                'rgba(54, 162, 235, 0.2)', // Color para presencias
                'rgba(255, 99, 132, 0.2)' // Color para ausencias
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)', // Borde para presencias
                'rgba(255,99,132,1)' // Borde para ausencias
              ],
              borderWidth: 1
            }]
          }


          const config: ChartConfiguration<ChartType> = {
            type: 'pie',
            data,
            options: {}
          };

          setTimeout(() => {
            new Chart(this.chartContainer.nativeElement, config);
            this.getSignatureByTeacherID(teacherID);
          });
        },
        error: (err: any) => {
          this.subjectDetail = null;
          this.appStatusService.unsetAsync();
        }
      });
    }
  }

  setAssistance(id: number, assistance: number, e: any) {
    e.stopPropagation();
    this.appStatusService.setAsync();

    const assistanceToInsert = {
      preceptorID: 4,
      assistance: assistance,
      courseID: this.courseAssistance?.id || 0,
      studentID: id,
      schoolSubjectID: this.courseAssistance?.schoolSubjectID || 0,
      groupID: this.courseAssistance?.groupID || 0
    }

    this.preceptorService.setSubjectAssistance(assistanceToInsert).subscribe({
      next: (response) => {
        const student = this.courseAssistance?.students.find(student => student.id === id);
        if (student) {
          student.assistance = assistance;

          if (this.studentAssistanceDetail && this.studentAssistanceDetail.id === id) {
            this.studentAssistanceDetail.assistance = assistance;
          }
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

  goBack() {
    this.subjectDetail = null;
  }

  setCurrStudentAssistanceAssistance(assistance: number) {
    if (this.currStudentAssistance) {
      this.currStudentAssistance.assistance = assistance;
    }
  }

  confirmModifStudentAssistance() {
    this.appStatusService.setAsync();
    if (this.currStudentAssistance) {
      const assistanceID = this.currStudentAssistance.assistance;
      this.currStudentAssistanceSubscription = this.preceptorService.updateAssistance({
        assistance: assistanceID,
        courseID: this.courseAssistanceByDate?.id || 0,
        studentID: this.currStudentAssistance.id,
        schoolSubjectID: this.courseAssistanceByDate?.schoolSubjectID || 0,
        obs: this.descriptionText,
        date: this.selectedDate,
        isJustified: assistanceID == 2 ? (this.justified === 'yes' ? true : false) : null,
        obsJust: assistanceID == 2 && this.justified === 'yes' ? this.justDescriptionText : null,
        groupID: this.courseAssistanceByDate?.groupID || 0
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

  onStudentAssistanceClick(studentID: number) {
    const student = this.courseAssistance?.students.find(student => student.id === studentID);

    if (student) {
      this.studentAssistanceDetail = { ...student };
    }

    else {
      this.studentAssistanceDetail = null;
      this.toastr.error('Error al cargar la asistencia', 'Error');
    }
  }

  closeModifStudentAssistance() {
    this.closeModifAssistanceModal();
    this.currStudentAssistance = null
  }

  closeModifAssistanceModal() {
    this.modifAssistanceModalRef.hide();
  }

  navigateToPreviousStudent() {
    const currentStudentIndex = this.courseAssistance?.students.findIndex(student => student.id === this.studentAssistanceDetail?.id);

    if (currentStudentIndex !== undefined && currentStudentIndex !== null) {
      if (currentStudentIndex > 0) {
        this.studentAssistanceDetail = this.courseAssistance?.students[currentStudentIndex - 1] || null;
      } else {
        this.studentAssistanceDetail = this.courseAssistance?.students[this.courseAssistance?.students.length - 1] || null;
      }
    }
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

  navigateToNextStudent() {
    const currentStudentIndex = this.courseAssistance?.students.findIndex(student => student.id === this.studentAssistanceDetail?.id);

    if (currentStudentIndex !== undefined && currentStudentIndex !== null) {
      if (this.courseAssistance?.students && currentStudentIndex < this.courseAssistance.students.length - 1) {
        this.studentAssistanceDetail = this.courseAssistance.students[currentStudentIndex + 1] || null;
      } else {
        this.studentAssistanceDetail = this.courseAssistance?.students[0] || null;
      }
    }
  }



  convertBase64ToBlobUrl(base64: string): SafeUrl {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
  }
}
