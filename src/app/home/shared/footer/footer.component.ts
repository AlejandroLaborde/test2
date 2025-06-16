import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {

  wpp: string = '';
  ig: string = '';
  in: string = '';
  mail: string = '';
  web: string = '';

  constructor() { }

  ngOnInit(): void {
    this.ig = localStorage.getItem('ig') || '';
    this.in = localStorage.getItem('in') || '';
    this.mail = localStorage.getItem('mail') || '';
    this.web = localStorage.getItem('web') || '';
    this.wpp = localStorage.getItem('wpp') || '';
  }
  
}
