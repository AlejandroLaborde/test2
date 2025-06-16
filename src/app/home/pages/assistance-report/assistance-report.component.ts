import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStatusService } from '../../../app-status.service';
import { AssistanceReport, PreceptorService } from '../../services/preceptor.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth/auth.service';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-assistance-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistance-report.component.html',
  styleUrl: './assistance-report.component.scss'
})
export class AssistanceReportComponent implements OnInit {

  color: string = '';

  asyncProccess = true;
  asyncProccessSubscription!: Subscription;

  showChart = false;
  isCourseDropdownOpen = false;
  isSchoolSubjectDropdownOpen = false;
  isStudentDropdownOpen = false;
  isYearDropdownOpen = false;
  isFrequenceDropdownOpen = false;
  signatureUrl: string | null = null;

  @ViewChild('chartCanvas') chartContainer!: ElementRef;
  private chart: Chart | null = null;

  isDownloadEnabled: boolean = false;

  routes: {
    [key: string]: {
      name: string,
      currentYear: boolean,
      schoolSubject: boolean,
      student: boolean,
      frequence: boolean
    }
  } = {
      'course-anual-assistance': {
        name: 'Asistencia anual por curso',
        currentYear: true,
        schoolSubject: false,
        student: false,
        frequence: false
      },
      'course-anual-subject-assistance': {
        name: 'Asistencia anual por materia',
        currentYear: true,
        schoolSubject: true,
        student: false,
        frequence: false
      },
      'course-quarter-assitance': {
        name: 'Asistencia por trimestre',
        currentYear: false,
        schoolSubject: false,
        student: false,
        frequence: true
      },
      'course-quarter-subject-assitance': {
        name: 'Asistencia por trimestre por materia',
        currentYear: false,
        schoolSubject: true,
        student: false,
        frequence: true
      },
      'student-anual-assistance': {
        name: 'Asistencia anual del alumno',
        currentYear: true,
        schoolSubject: false,
        student: true,
        frequence: false
      },
      'student-anual-subject-assistance': {
        name: 'Asistencia anual por materia del alumno',
        currentYear: true,
        schoolSubject: true,
        student: true,
        frequence: false
      },
      'student-quarter-assitance': {
        name: 'Asistencia por trimestre del alumno',
        currentYear: false,
        schoolSubject: false,
        student: true,
        frequence: true
      },
      'student-quarter-subject-assitance': {
        name: 'Asistencia por trimestre por materia del alumno',
        currentYear: false,
        schoolSubject: true,
        student: true,
        frequence: true
      }
    }

  route: string = '';

  courses: {
    id: number,
    name: string
  }[] = [];
  coursesSubscription!: Subscription;

  schoolSubjects: {
    id: number,
    name: string
  }[] | null = null;

  students: {
    id: number,
    name: string
  }[] | null = null;

  years: number[] | null = null;

  filtersSubscription!: Subscription;

  count: number = 1;

  selectedCourse: number = 0;
  selectedSchoolSubject: number = 0;
  selectedStudent: number = 0;
  selectedYear: number = 0;
  selectedFrequence: number = 0;

  assistanceReport: AssistanceReport[] | null = null;
  assistanceReportSubscription!: Subscription;

  lastSelectedItems: {
    year: number | null | string,
    course: string | null,
    schoolSubject: string | null,
    student: string | null,
    frequence: number | null
  } = {
      year: null,
      course: null,
      schoolSubject: null,
      student: null,
      frequence: null
    }


  constructor(
    private appStatusService: AppStatusService,
    private preceptorService: PreceptorService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.route = this.router.url.replace('/home/', '');

    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';

    this.asyncProccessSubscription = this.appStatusService.asyncProccess.subscribe({
      next: (value) => {
        this.asyncProccess = value;
      },
      error: (err) => {
        this.asyncProccess = false;
      },
      complete: () => {
        this.asyncProccess = false;
      }
    });
    this.authService.getSignature().subscribe(response => {
      const base64Image = response.body.firma;
      this.signatureUrl = 'data:image/png;base64,' + base64Image;
    });

    this.routes[this.route].schoolSubject && this.count++;

    this.routes[this.route].student && this.count++;

    this.routes[this.route].currentYear && this.count++;

    this.routes[this.route].frequence && this.count++;

    this.appStatusService.setAsync();

    this.coursesSubscription = this.preceptorService.getCoursesFilter().subscribe({
      next: (value) => {
        this.courses = value.courses;
        this.selectedCourse = this.courses[0].id;

        this.onChangeCourse(null);
      },
      error: (err) => {
        this.toastr.error('Error al obtener los cursos', 'Error');
      },
      complete: () => {
        this.coursesSubscription.unsubscribe();
      }
    });
  }
  onFocusStudentDropdown() {
    this.isStudentDropdownOpen = true;
  }

  onBlurStudentDropdown() {
    this.isStudentDropdownOpen = false;
  }

  onFocusSchoolSubjectDropdown() {
    this.isSchoolSubjectDropdownOpen = true;
  }

  onBlurSchoolSubjectDropdown() {
    this.isSchoolSubjectDropdownOpen = false;
  }

  onFocusCourseDropdown() {
    this.isCourseDropdownOpen = true;
  }

  onBlurCourseDropdown() {
    this.isCourseDropdownOpen = false;
  }

  onFocusYearDropdown() {
    this.isYearDropdownOpen = true;
  }

  onBlurYearDropdown() {
    this.isYearDropdownOpen = false;
  }

  onFocusFrequenceDropdown() {
    this.isFrequenceDropdownOpen = true;
  }

  onBlurFrequenceDropdown() {
    this.isFrequenceDropdownOpen = false;
  }



  onChangeCourse(event: any) {
    const filtersByCourse = [];

    this.appStatusService.setAsync();

    if (this.routes[this.route].schoolSubject) {
      filtersByCourse.push('schoolSubject');
    };

    if (this.routes[this.route].student) {
      filtersByCourse.push('student');
    };

    if (this.routes[this.route].currentYear) {
      filtersByCourse.push('year');
    }

    this.filtersSubscription = this.preceptorService.getFiltersByCourse(filtersByCourse, this.selectedCourse).subscribe({
      next: (value) => {
        if (this.routes[this.route].schoolSubject && value.schoolSubjects) {
          this.schoolSubjects = value.schoolSubjects;
          this.selectedSchoolSubject = this.schoolSubjects![0].id;
        };

        if (this.routes[this.route].student && value.students) {
          this.students = value.students;
          this.selectedStudent = this.students![0].id;
        };

        if (this.routes[this.route].currentYear && value.years) {
          this.years = value.years;
          this.selectedYear = this.years![0];
        };

      },
      error: (err) => {
        this.toastr.error('Error al obtener los filtros', 'Error');
      },
      complete: () => {
        this.filtersSubscription.unsubscribe();
        this.appStatusService.unsetAsync();
      }
    });

  }

  onChangeSchoolSubject(event: any) {
    console.log(event)
  }

  onChangeStudent(event: any) {
    console.log(event)
  }

  onChangeYear(event: any) {
    console.log(event)
  }

  onChangeFrequence(event: any) {
    console.log(event)
  }

  generateReport() {
    const filters = {
      courseID: this.selectedCourse,
      schoolSubjectID: this.routes[this.route].schoolSubject && this.selectedSchoolSubject ? this.selectedSchoolSubject : undefined,
      studentID: this.routes[this.route].student && this.selectedStudent ? this.selectedStudent : undefined,
      year: this.routes[this.route].currentYear && this.selectedYear ? this.selectedYear : undefined,
      quarter: this.routes[this.route].frequence ? `${this.selectedFrequence}` : undefined
    };

    this.preceptorService.getAssistanceReport(filters).subscribe({
      next: (value) => {
        this.assistanceReport = value;

        this.isDownloadEnabled = true;

        const presents = {
          P: 0,
          A: 0,
          AP: 0,
          T: 0
        };

        this.lastSelectedItems = {
          year: this.routes[this.route].currentYear && this.selectedYear ? this.selectedYear : '',
          course: this.courses.find((curr) => curr.id === this.selectedCourse)?.name || null,
          schoolSubject: this.routes[this.route].schoolSubject && this.schoolSubjects?.find((curr) => curr.id === this.selectedSchoolSubject)?.name || null,
          student: this.routes[this.route].student && this.students?.find((curr) => curr.id === this.selectedStudent)?.name || null,
          frequence: this.routes[this.route].frequence ? this.selectedFrequence : null
        };

        this.assistanceReport.forEach((curr) => {
          presents.P += curr.idTypeAssistance === 1 ? 1 : 0;
          presents.A += curr.idTypeAssistance === 2 ? 1 : 0;
          presents.AP += curr.idTypeAssistance === 4 ? 1 : 0;
          presents.T += curr.idTypeAssistance === 3 ? 1 : 0;
        });

        const total = presents.P + presents.A + presents.AP + presents.T;
        const percentages = {
          P: total > 0 ? ((presents.P / total) * 100).toFixed(2) : '0.00',
          A: total > 0 ? ((presents.A / total) * 100).toFixed(2) : '0.00',
          AP: total > 0 ? ((presents.AP / total) * 100).toFixed(2) : '0.00',
          T: total > 0 ? ((presents.T / total) * 100).toFixed(2) : '0.00'
        };

        const data = {
          labels: [
            `Presente (${percentages.P}%)`,
            `Ausente (${percentages.A}%)`,
            `Ausente con presencia (${percentages.AP}%)`,
            `Tarde (${percentages.T}%)`
          ],
          datasets: [{
            label: 'Cantidad',
            data: [presents.P, presents.A, presents.AP, presents.T],
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255,99,132,1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        };

        this.showChart = true;

        // Destruye el gráfico existente si ya hay uno
        if (this.chart) {
          this.chart.destroy();
        }

        // Configuración del gráfico
        const config: ChartConfiguration<ChartType> = {
          type: 'pie',
          data,
          options: {}
        };

        setTimeout(() => {
          // Crea un nuevo gráfico y guarda la referencia
          this.chart = new Chart(this.chartContainer.nativeElement, config);
          this.appStatusService.unsetAsync();
        });
      },
      error: (err) => {
        this.toastr.error('Error al obtener el reporte', 'Error');
      },
      complete: () => {
        this.appStatusService.unsetAsync();
      }
    });

    this.appStatusService.setAsync();
  }

  downloadReport() {
    this.generatePDF();
  }

  async generatePDF() {
    const canvas = this.chartContainer.nativeElement;
    const imageBase64 = canvas.toDataURL('image/png'); // Obtén la URL base64 de la imagen

    const pdf = new jsPDF();

    // Llama a la función para convertir la imagen a base64
    const athenaImageBase64 = await this.convertImageToBase64('/assets/img/athena.png');

    // Encabezado y Logotipo (alineado a la izquierda)
    pdf.addImage(athenaImageBase64, 'PNG', 3, 3, 25, 25); // Ajusta el tamaño del logotipo

    const schoolName = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).nombre : '';

    // Filtros y Descripción (alineado a la izquierda)
    const title = `${schoolName}\n` + this.routes[this.route].name + '\nCurso: ' + this.lastSelectedItems.course;
    pdf.text(title, 100, 20, {
      align: 'center'
    });

    // Fecha Actual (alineado a la derecha)
    const currentDate = new Date().toLocaleString();
    pdf.text(currentDate, 155, 20, {});

    const frequence = this.routes[this.route].frequence ? this.lastSelectedItems.frequence == 0 ? 'Anual' : 'Trimestre: ' + (this.lastSelectedItems.frequence == 1 ? '1ero' : this.lastSelectedItems.frequence == 2 ? '2do' : '3ero') : '';
    const year = this.routes[this.route].currentYear ? 'Año: ' + this.lastSelectedItems.year : '';
    const schoolSubject = this.routes[this.route].schoolSubject ? 'Materia: ' + this.lastSelectedItems?.schoolSubject : '';
    const student = this.routes[this.route].student ? 'Alumno: ' + this.lastSelectedItems?.student : '';

    const filters = [frequence, year, schoolSubject, student].filter((curr) => curr !== '').join('\n');

    // Gráfico de Porcentaje de Asistencia (alineado al centro)
    pdf.addImage(imageBase64, 'PNG', 70, 40, 75, 75); // Ajusta la posición y el tamaño del gráfico

    const presents = {
      P: 0,
      A: 0,
      AP: 0,
      T: 0,
      total: 0
    };

    this.assistanceReport?.forEach((curr) => {
      presents.P += curr.idTypeAssistance === 1 ? 1 : 0;
      presents.A += curr.idTypeAssistance === 2 ? 1 : 0;
      presents.AP += curr.idTypeAssistance === 4 ? 1 : 0;
      presents.T += curr.idTypeAssistance === 3 ? 1 : 0;
      presents.total++;
    });

    // Información Adicional (alineado a la izquierda)
    const total = presents.P + presents.A + presents.AP + presents.T;

    const presentPercentage = total > 0 ? ((presents.P / total) * 100).toFixed(0) : '0';
    const ausentePercentage = total > 0 ? ((presents.A / total) * 100).toFixed(0) : '0';
    const ausenteConPresenciaPercentage = total > 0 ? ((presents.AP / total) * 100).toFixed(0) : '0';
    const tardePercentage = total > 0 ? ((presents.T / total) * 100).toFixed(0) : '0';
    const additionalInfo = `Presentes: ${presents.P} - ${presentPercentage}%\nAusentes: ${presents.A} - ${ausentePercentage}%\nAusentes con presencia: ${presents.AP} - ${ausenteConPresenciaPercentage}%\nTardes: ${presents.T} - ${tardePercentage}%`;
    pdf.text(additionalInfo, 10, 130);

    const tableData = this.assistanceReport?.map((report) => [
      report.idAssistance.toString(),
      report.date,
      report.observation,
      report.student,
      report.assistance,
      report.course,
    ]);

    const tableColumns = [
      { header: 'ID', dataKey: 'idAssistance' },
      { header: 'Fecha', dataKey: 'date' },
      { header: 'Observación', dataKey: 'observation' },
      { header: 'Estudiante', dataKey: 'student' },
      { header: 'Asistencia', dataKey: 'assistance' },
      { header: 'Curso', dataKey: 'course' },
    ];

    autoTable(pdf, {
      head: [['Fecha', 'Estudiante', 'Asistencia']],
      body: this.assistanceReport?.map((report) => [report.date, report.student, report.assistance]),
      startY: 160,
    })

    const totalPages = pdf.getNumberOfPages();
    pdf.setPage(1);
    pdf.text(filters + `\nTotal de hojas: ${totalPages}`, 200, 130, {
      align: 'right'
    });

    if (this.signatureUrl) {

      const base64Image = this.signatureUrl as string;

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Página ${i} de ${totalPages}`, 185, pdf.internal.pageSize.height - 5, {
          align: 'right'
        });
        pdf.addImage(base64Image, 'PNG', 185, pdf.internal.pageSize.height - 20, 20, 20);
      }
    } else {
      // agrega el número de página al pie de cada página pero sin la firma
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Página ${i} de ${totalPages}`, 185, pdf.internal.pageSize.height - 5, {
          align: 'right'
        });
      }
    }

    const currLocaleDateTime = new Date().toLocaleString().replaceAll('/', '-').replaceAll(':', '-').replaceAll(' ', '_').replaceAll(',', '');

    pdf.save(this.routes[this.route].name.replaceAll(' ', '_') + '-' + currLocaleDateTime + '.pdf'); // Descarga el PDF con un nombre específico
  }

  convertImageToBase64(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Crea un objeto de imagen
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Soluciona problemas de CORS si la imagen está en un servidor diferente
      img.src = path;
      img.onload = () => {
        // Crea un canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx?.drawImage(img, 0, 0);
        // Convierte la imagen en canvas a base64
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      };
      img.onerror = error => reject(error);
    });
  }
}
