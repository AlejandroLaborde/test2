import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(
    private http: HttpClient
  ) { }

  getAllMySubjects(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/view/subjects`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getMySubjectsDetails(schoolSubjectID: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/view/subjects/detail?schoolSubjectID=${schoolSubjectID}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getCourseSubjectAssistance(schoolSubjectID:number, quarter:number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/view/subjects/course-assistance?quarter=${quarter}&schoolSubjectGroupID=${schoolSubjectID}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }
}
