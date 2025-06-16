import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient
  ) { }

  getExample(example:string) {
    const request = `${environment.apiUrl}/massive-upload?example=${example}`
    return this.http.get(request, { observe: 'response', responseType: 'blob' });
  }

  postBase64XLSX(file: string, type: string) {
    const request = `${environment.apiUrl}/massive-upload`
    return this.http.post(request, { file, type }, { observe: 'response' });
  }

  postBase64PNG(file: string, dni: string) {
    const request = `${environment.apiUrl}/user-signature`
    return this.http.post(request, { file, dni }, { observe: 'response' });
  }
}
