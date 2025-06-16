import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import ls from 'localstorage-slim';
import { LoginData } from '../../../interfaces/session.interface';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
    const modules:LoginData['modules'] = ls.get('modules', { decrypt: true }) || [];
    let principalModule = modules[0]?.children && modules[0]?.children[0]?.name || modules[0]?.name;

    if(principalModule) {
      this.router.navigate(['/home/' + principalModule]);
    }
  }

}
