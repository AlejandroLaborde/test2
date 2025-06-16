import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SideBarComponent } from './shared/side-bar/side-bar.component';
import { SessionComponent } from './shared/session/session.component';
import { FooterComponent } from './shared/footer/footer.component';
import { validatePermissionGuard } from '../core/guards/validate-permission.guard';
import {redirectEmptyPathGuard} from '../core/guards/redirect-empty-path.guard';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

export const routes: Routes = [
  {path: '', redirectTo: 'welcome', pathMatch: 'full'},
  {path: 'welcome', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./shared/welcome/welcome.component').then(m => {
    return m.WelcomeComponent
  })},
  {path: 'massive-upload', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/bulk-upload/bulk-upload.component').then(m => {

    return m.BulkUploadComponent
  })},
  {path: 'reset-password', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => {

    return m.ResetPasswordComponent
  })},
  {path: 'Student-profile', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/my-children/my-children.component').then(m => {

    return m.MyChildrenComponent
  })},
  {path: 'My-subjects',  pathMatch: 'full', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/my-subjects/my-subjects.component').then(m => {

    return m.MySubjectsComponent
  })},
  {path: 'unauthorized', loadComponent: () => import('./shared/unauthorized/unauthorized.component').then(m => {

    return m.UnauthorizedComponent
  })},
  {path: 'My-courses', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/manage-assistance/manage-assistance.component').then(m => {

    return m.ManageAssistanceComponent
  })},
  {path: 'course-anual-assistance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'course-anual-subject-assistance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'course-quarter-assitance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'course-quarter-subject-assitance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'student-anual-assistance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'student-anual-subject-assistance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'student-quarter-assitance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'student-quarter-subject-assitance', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/assistance-report/assistance-report.component').then(m => {

    return m.AssistanceReportComponent
  })},
  {path: 'all-courses', canActivate: [redirectEmptyPathGuard, validatePermissionGuard], loadComponent: () => import('./pages/manage-assistance/manage-assistance.component').then(m => {

    return m.ManageAssistanceComponent
  })},
  {path: 'not-found', loadComponent: () => import('./shared/not-found/not-found.component').then(m => {

    return m.NotFoundComponent
  })},
  {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, SideBarComponent, SessionComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  currentDate: Date;
  dateTimer: any;

  version = environment.version;

  constructor () {{
    this.currentDate = new Date();
  }}

  ngOnInit(): void {
    this.dateTimer = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy() {
    clearInterval(this.dateTimer);
  }
}