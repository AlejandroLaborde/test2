import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  children:{name:string; lastName:string; id: number}[] = [
    {name: 'Juan', lastName: 'Perez', id: 1},
    {name: 'Maria', lastName: 'Gomez', id: 2},
    {name: 'Pedro', lastName: 'Rodriguez', id: 3},
    {name: 'Lucia', lastName: 'Gutierrez', id: 4},
    {name: 'Ana', lastName: 'Lopez', id: 5}
  ];

  allChildrens: {
    name: string;
    lastName: string;
    id: number;
    image: string;
  }[] = [
    {name: 'Juan', lastName: 'Perez', id: 1, image: '/assets/img/student.jpg'},
    {name: 'Maria', lastName: 'Gomez', id: 2, image: '/assets/img/student.jpg'},
    {name: 'Pedro', lastName: 'Rodriguez', id: 3, image: '/assets/img/student.jpg'},
    {name: 'Lucia', lastName: 'Gutierrez', id: 4, image: '/assets/img/student.jpg'},
    {name: 'Ana', lastName: 'Lopez', id: 5, image: '/assets/img/student.jpg'}
  ]

  constructor(
    private http: HttpClient
  ) { }

  getAllMyChildren():Observable<{name:string; lastName:string; id: number}[]> {
    // hace una peticion a la api/my-children?parentID=5 donde parentID es el id del padre logueado
    // se puede obtener el id desde localStorage.getItem('id')
    // y debe devolver siempre lo que esta dentro del body de la respuesta
    const userID = localStorage.getItem('id');
    return this.http.get<{name:string; lastName:string; id: number}[]>(`${environment.apiUrl}/my-children?parentID=${userID}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }


  getChildrenById(id: number):Observable<{name:string; lastName:string; id: number, image:string}> {
    // hace una peticion a la api/child?childID=2 donde childID es el id
    return this.http.get<{name:string; lastName:string; id: number, image:string}>(`${environment.apiUrl}/child?childID=${id}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getAllChildSubjects (childID: number) {
    // '/child/subjects'
    // hace una peticion a la api/child/subjects?childID=5 donde childID es el id del hijo
    return this.http.get(`${environment.apiUrl}/child/subjects?childID=${childID}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getSubjectDetail(schoolSubjectID: number, childID: number) {
    // '/child/subject/detail'
    //const { schoolSubjectID, childID } = req.query;
    // hace una peticion a la api/child/subject/detail?schoolSubjectID=5&childID=2 donde schoolSubjectID es el id de la materia y childID es el id del hijo

    return this.http.get(`${environment.apiUrl}/child/subject/detail?schoolSubjectID=${schoolSubjectID}&childID=${childID}`).pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  delay (ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
