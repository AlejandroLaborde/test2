import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', pathMatch: 'prefix',
        loadComponent: () => import('./home/home.component').then(m => {
            return m.HomeComponent
        }),
        children: [
            {
                path: '', 
                loadChildren: () => import('./home/home.component').then(m => {
                    return m.routes
                }),
            },
        ]
    },
    { path: '', redirectTo: 'home', pathMatch: 'prefix' },
];
