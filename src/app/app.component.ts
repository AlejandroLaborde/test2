import { Component, OnDestroy, OnInit, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppStatusService } from './app-status.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  providers: [AppStatusService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'atenas';

  schoolColor: string = '';

  isLogged!:WritableSignal<boolean>;
  isLoggedSubscription!: Subscription;

  constructor(
    private appStatusService: AppStatusService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.isLogged = this.appStatusService.getLoggedUser()
    
    const isLoggedIn = this.appStatusService.isLoggedIn();

    // loguea la ruta actual
    // con el método navigate de router
    if(isLoggedIn) {
      this.appStatusService.setLoggedUser();
      this.appStatusService.setLoggedOut();
    } else {
      this.appStatusService.setLoggedOutUser();
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.isLoggedSubscription.unsubscribe();
  }

}