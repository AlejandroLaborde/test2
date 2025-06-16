import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppStatusService } from '../../../app-status.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent implements OnInit {

  color = '';
  asyncProccess = false;
  asyncProccessSubscription!: Subscription;
  current:string = ''

  //alumnos, profesores, padres, preceptor, directivo, secretario, materias, cursos, datos de escuela, notas, asistencias, eventos
  cards: {
    title:string,
    link: 'user'|'career' |'school'|'course'|'course-student'|'course-teacher',
    validations:any|null,
    modal: Function,
    type: 'xlsx'|'png'
  }[] = [
    {
      title: 'Carga masiva de usuarios',
      link: 'user',
      validations: null,
      modal: this.getUserValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga masiva de carreras',
      link: 'career',
      validations: null,
      modal: this.getSchoolCareerValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga masiva de datos de escuela',
      link: 'school',
      validations: null,
      modal: this.getSchoolValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga masiva de cursos',
      link: 'course',
      validations: null,
      modal: this.getCourseValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga masiva de alumnos en cursos',
      link: 'course-student',
      validations: null,
      modal: this.getCourseStudentValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga masiva de docentes en cursos',
      link: 'course-teacher',
      validations: null,
      modal: this.getCourseTeacherValidationsModal.bind(this),
      type:'xlsx'
    },
    {
      title: 'Carga de firma de usuarios',
      link: 'user',
      validations: null,
      modal: this.getUserValidationsModal.bind(this),
      type:'png'
    }
  ]

  @ViewChild('userValidationsModal') userValidationsModal!: ElementRef;
  userValidationsModalRef: any;

  @ViewChild('schoolValidationsModal') schoolValidationsModal!: ElementRef;
  schoolValidationsModalRef: any;

  @ViewChild('courseValidationsModal') courseValidationsModal!: ElementRef;
  courseValidationsModalRef: any;

  @ViewChild('courseStudentValidationsModal') courseStudentValidationsModal!: ElementRef;
  courseStudentValidationsModalRef: any;

  @ViewChild('courseTeacherValidationsModal') courseTeacherValidationsModal!: ElementRef;
  courseTeacherValidationsModalRef: any;

  @ViewChild('schoolCareerValidationsModal') schoolCareerValidationsModal!: ElementRef;
  schoolCareerValidationsModalRef: any;

  constructor(
    private appStatusService: AppStatusService,
    private adminService: AdminService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    
    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';

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
  }

  openFileSelector(current: 'user'|'career'|'school'|'course'|'course-student'|'course-teacher', type:'xlsx'|'png') {
    this.current = current;
    const fileInput = document.getElementById('fileInput-' + type);
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileInput(event: any, type:'xlsx'|'png') {
    // Obtener el archivo seleccionado
    // convertirlo a base 64
    // enviarlo a BE

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if(type === 'png') {
        // obtiene el nombre del archivo, por ejemplo 'firma.png'
        // y separa el nombre de la extensión
        const fileName = file.name.split('.')[0];

        // si el nombre no es un DNI, no se sube el archivo
        // 8 o 9 caracteres numéricos
        if(!/^\d{8,9}$/.test(fileName)) {
          this.toastr.error('El archivo no es una firma válida');
          return;
        }

        this.uploadPNG(reader.result as string, fileName);

        return;

      }
      this.uploadFile(reader.result as string);
    }
  }

  uploadFile(file: string) {
    this.appStatusService.setAsync()
    this.adminService.postBase64XLSX(file, this.current).subscribe({
      next: (httpResponse:any) => {
        this.appStatusService.unsetAsync();
        // setea las validaciones en null
        const card = this.cards.find(card => card.link === this.current);
        if(card) {
          card.validations = null;
        }

        if(httpResponse.body.body && httpResponse.body.body.notInserted && httpResponse.body.body.notInserted.length > 0) {
          const card = this.cards.find(card => card.link === this.current);

          if(card) {
            card.validations = httpResponse.body.body.notInserted;
          }
        }

        if(httpResponse.body.body && httpResponse.body.body.validations && httpResponse.body.body.validations.length > 0) {
          const card = this.cards.find(card => card.link === this.current);

          if(card) {
            card.validations = httpResponse.body.body.validations;
          }
        }


        this.toastr.clear();
        this.toastr.success('Carga exitosa');
      },
      error: (err) => {
        this.appStatusService.unsetAsync();
        console.log(err)
        if(err.error.body && err.error.body.validations) {
          const card = this.cards.find(card => card.link === this.current);

          if(card) {
            card.validations = err.error.body.validations;
          }
        }
        
        this.toastr.clear();
        this.toastr.error('Error al cargar el archivo');
      }
    });
  }

  uploadPNG(file: string, dni: string) {
    this.appStatusService.setAsync()
    this.adminService.postBase64PNG(file, dni).subscribe({
      next: (httpResponse) => {
        this.appStatusService.unsetAsync();
        this.toastr.clear();
        this.toastr.success('Carga exitosa');
      },
      error: (err) => {
        this.appStatusService.unsetAsync();
        this.toastr.clear();
        this.toastr.error('Error al cargar el archivo');
      }
    });
  }



  getExample(example:'user'|'career'|'school'|'course'|'course-student'|'course-teacher') {
    const current =  {
      user: 'ejemplo-usuarios.xlsx',
      career: 'ejemplo-carreras.xlsx',
      school: 'ejemplo-escuela.xlsx',
      course: 'ejemplo-cursos.xlsx',
      'course-student': 'ejemplo-alumnos-cursos.xlsx',
      'course-teacher': 'ejemplo-docentes-cursos.xlsx'
    }
    this.current = example;
    this.appStatusService.setAsync()
    this.adminService.getExample(example).subscribe({
      next: (httpResponse) => {
        this.appStatusService.unsetAsync();
    
        // Extraer el nombre del archivo del header 'Content-Disposition'
        const contentDisposition = httpResponse.headers.get('Content-Disposition');
        let filename = current[example]
    
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, ''); // Eliminar comillas si están presentes
          }
        }

        if(httpResponse.body != null) {
    
          // Crear un objeto URL a partir del Blob
          const url = window.URL.createObjectURL(httpResponse.body);
            
          // Crear un elemento <a> temporal para iniciar la descarga
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = url;
          a.download = filename; // Usar el nombre extraído del header
          a.click();
            
          // Limpiar la URL del objeto después de la descarga
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      },
      error: (err) => {
        this.toastr.clear();
        this.toastr.error('Error al descargar el archivo');
      }
    });
  }

  getUserValidationsModal() {
    var userValidationsModal = new bootstrap.Modal(this.userValidationsModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.userValidationsModalRef = userValidationsModal;
    this.userValidationsModalRef.show();
  }

  closeUserModal () {
    this.userValidationsModalRef.hide();
  }

  getSchoolValidationsModal() {
    var schoolValidationsModal = new bootstrap.Modal(this.schoolValidationsModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.schoolValidationsModalRef = schoolValidationsModal;
    this.schoolValidationsModalRef.show();
  }

  closeSchoolModal() {
    this.schoolValidationsModalRef.hide();
  }

  getCourseValidationsModal() {
    var courseValidationsModal = new bootstrap.Modal(this.courseValidationsModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.courseValidationsModalRef = courseValidationsModal;
    this.courseValidationsModalRef.show();
  }

  closeCourseModal() {
    this.courseValidationsModalRef.hide();
  }

  getCourseStudentValidationsModal() {
    var courseStudentValidationsModal = new bootstrap.Modal(this.courseStudentValidationsModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.courseStudentValidationsModalRef = courseStudentValidationsModal;
    this.courseStudentValidationsModalRef.show();
  }

  closeCourseStudentModal() {
    this.courseStudentValidationsModalRef.hide();
  }

  getCourseTeacherValidationsModal() {
    var courseTeacherValidationsModal = new bootstrap.Modal(this.courseTeacherValidationsModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.courseTeacherValidationsModalRef = courseTeacherValidationsModal;
    this.courseTeacherValidationsModalRef.show();
  }

  closeCourseTeacherModal() {
    this.courseTeacherValidationsModalRef.hide();
  }

  getSchoolCareerValidationsModal() {}

  closeSchoolCareerModal() {}
}
