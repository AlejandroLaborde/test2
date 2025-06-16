import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStatusService } from '../../../app-status.service';
import { ParentService } from '../../services/parent.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import * as bootstrap from 'bootstrap';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth/auth.service';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-my-children',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-children.component.html',
  styleUrl: './my-children.component.scss'
})
export class MyChildrenComponent implements OnInit, OnDestroy {

  @ViewChild('modifAssistanceModal') modifAssistanceModal!: ElementRef;
  modifAssistanceModalRef: any;

  color = ''

  @ViewChild('chartCanvas') chartContainer!: ElementRef;

  children:{name:string; lastName:string; id: number}[] = [];
  allMyChildrenSubscription: Subscription|null = null;

  currentChildren:{
    image:string;
    name:string;
    lastName:string;
    id: number;
  }|null = null;
  currentChildrenSubscription: Subscription|null = null;

  asyncProccess = false;
  asyncProccessSubscription!: Subscription;

  subjectsList:boolean = false;
  subjectListSubscription!: Subscription;
  subjectDetail: any | null = null
  subjectDetailSubscription!: Subscription;

  subjects: any[] = [];

  isNan = isNaN;

  objectKeys = Object.keys;

  signatureURL: SafeUrl | null = null;

  constructor(
    private appStatusService: AppStatusService,
    private parentService: ParentService,
    private toastr: ToastrService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
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

    this.appStatusService.setAsync();
    this.allMyChildrenSubscription = this.parentService.getAllMyChildren().subscribe({
      next: (children) => {
        this.children = [...children];
        if(this.children.length > 0){
          this.updateCurrentChildren(this.children[0].id)
        } else {
          this.appStatusService.unsetAsync();
          this.getNoChildrenModal();
          this.toastr.info('No tienes hijos registrados', 'Info');
        }
      },
      error: (err) => {
        if(err.error.message){
          this.toastr.error(err.error.message, 'Error');
        } else {
          this.toastr.error('Ocurrió un error inesperado', 'Error');
        }
        this.appStatusService.unsetAsync();
      },
      complete: () => {
      }
    })
  }

  ngOnDestroy () {
    this.allMyChildrenSubscription && this.allMyChildrenSubscription.unsubscribe();
    this.currentChildrenSubscription && this.currentChildrenSubscription.unsubscribe();
    this.asyncProccessSubscription.unsubscribe();
  }

  setCurrentChildren(e:any){
    this.updateCurrentChildren(Number(e.target.value));
  }

  updateCurrentChildren(id:number){
    this.appStatusService.setAsync();
    this.currentChildrenSubscription = this.parentService.getChildrenById(id).subscribe({
      next: (child) => {
        this.currentChildren = {...child};
        this.appStatusService.unsetAsync();
      },
      error: (err) => {
        if(err.error.message){
          this.toastr.error(err.error.message, 'Error');
        } else this.toastr.error('Ocurrió un error inesperado', 'Error');
        this.appStatusService.unsetAsync();
      },
      complete: () => {
        this.appStatusService.unsetAsync();
      }
    })
  }

  setSubjects() {
    this.getAllChildSubjects(this.currentChildren!.id);
  }

  getSubjectDetail(subjectID: number) {
    this.appStatusService.setAsync();

    const teacherID = this.subjects.find((subject) => subject.schoolSubjectID === subjectID).teacherID;

    this.subjectDetailSubscription = this.parentService.getSubjectDetail(subjectID, this.currentChildren!.id).subscribe({
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


        const config: ChartConfiguration<ChartType>  = {
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

  getAllChildSubjects (childID: number) {
    this.appStatusService.setAsync();
    this.subjectListSubscription = this.parentService.getAllChildSubjects(childID).subscribe({
      next: (res: any) => {
        this.subjects = res;
        this.appStatusService.unsetAsync();
        this.subjectsList = true;
      },
      error: (err: any) => {
        this.appStatusService.unsetAsync();
        this.subjectsList = false;
      },
      complete: () => {
        this.appStatusService.unsetAsync();
        this.subjectListSubscription.unsubscribe();
      }
    });
  }

  getNoChildrenModal () {
    var modifAssistanceModal = new bootstrap.Modal(this.modifAssistanceModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });

    this.modifAssistanceModalRef = modifAssistanceModal;
    this.modifAssistanceModalRef.show();
  }

  goBack() {
    this.subjectDetail = null;
  }

  closeModal () {
    this.modifAssistanceModalRef.hide();
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
        this.toastr.error('Error al cargar la firma', 'Error');
        this.appStatusService.unsetAsync();
      }
    })
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
