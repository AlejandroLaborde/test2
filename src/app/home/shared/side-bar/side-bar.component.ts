import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import ls from 'localstorage-slim';
import { Modules } from '../../../interfaces/session.interface';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent implements OnInit {

  color = ''
  isSidebarOpen = false;

  routes: any = {
    'reset-password': "Recuperar contraseña",
    'bulk-upload': 'Carga masiva'
  }

  modules: {
    id: number;
    name: string;
    route: string;
    permission: 'L' | 'E';
    children?: any[] | null;
    isCollapsed: boolean;
    icon: string;
  }[] = []

  imgURL: string = '';
  schoolName: string = '';

  constructor(
    public router: Router
  ) { }

  ngOnInit() {
    this.color = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).color : '';
    this.imgURL = localStorage.getItem('school') && JSON.parse(localStorage.getItem('school')!).logo ? JSON.parse(localStorage.getItem('school')!).logo : '/assets/img/athena.png';
    this.schoolName = localStorage.getItem('school') ? JSON.parse(localStorage.getItem('school')!).nombre : 'Sistema de gestión escolar';

    const modules: Modules[] | null = ls.get('modules', { decrypt: true }) || [];

    this.modules = modules && modules.map(m => {

      const children = m.children && m.children.map(c => {
        return {
          id: c.id,
          name: c.description,
          route: c.name,
          permission: c.permission,
          icon: c.icon
        }
      }) || null

      return {
        id: m.id,
        name: m.description,
        route: m.name,
        permission: m.permission,
        children,
        icon: m.icon,
        isCollapsed: false
      }

    }) || []
  }

  toggleCollapse(index: number) {
    this.modules[index].isCollapsed = !this.modules[index].isCollapsed;
  }
}
