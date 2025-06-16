import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment'

export interface AssistanceReport {
                idAssistance: number,
                date: string,
                dateModification?: string,
                observation: string,
                student: string,
                assistance: string,
                idTypeAssistance: number,
                preceptor?: string,
                schoolSubject?: string,
                teacher?: string,
                course: string
            }

@Injectable({
  providedIn: 'root'
})
export class PreceptorService {

  courses: any[] = [
    { id: 1, name: 'Curso 1' },
    { id: 2, name: 'Curso 2' },
  ];

  currentAssistance: {
    id: number,
    name: string,
    students: {
      id: number,
      name: string,
      assistance: number
    }[]
  }[] = [
      {
        id: 1, name: 'Curso 1', students: [
          { id: 1, name: 'Alumno 1', assistance: 0 },
          { id: 2, name: 'Alumno 2', assistance: 0 },
          { id: 3, name: 'Alumno 3', assistance: 0 },
          { id: 4, name: 'Alumno 4', assistance: 0 },
          { id: 5, name: 'Alumno 5', assistance: 0 },
        ]
      },
      {
        id: 2, name: 'Curso 2', students: [
          { id: 6, name: 'Alumno 6', assistance: 0 },
          { id: 7, name: 'Alumno 7', assistance: 0 },
          { id: 8, name: 'Alumno 8', assistance: 0 },
          { id: 9, name: 'Alumno 9', assistance: 0 },
          { id: 10, name: 'Alumno 10', assistance: 0 },
        ]
      }
    ];

  courseAssistanceByDate: {
    id: number,
    name: string,
    dates: {
      date: string, // 'YYYY-MM-DD'
      students: {
        id: number,
        name: string,
        assistance: number
      }[]
    }[]
  }[] = [
      {
        id: 1, name: 'Curso 1', dates: [
          {
            date: '2021-09-01', students: [
              { id: 1, name: 'Alumno 1', assistance: 2 },
              { id: 2, name: 'Alumno 2', assistance: 1 },
              { id: 3, name: 'Alumno 3', assistance: 1 },
              { id: 4, name: 'Alumno 4', assistance: 2 },
              { id: 5, name: 'Alumno 5', assistance: 4 },
            ]
          },
          {
            date: '2021-09-02', students: [
              { id: 1, name: 'Alumno 1', assistance: 1 },
              { id: 2, name: 'Alumno 2', assistance: 1 },
              { id: 3, name: 'Alumno 3', assistance: 2 },
              { id: 4, name: 'Alumno 4', assistance: 3 },
              { id: 5, name: 'Alumno 5', assistance: 1 },
            ]
          },
          {
            date: '2021-09-03', students: [
              { id: 1, name: 'Alumno 1', assistance: 1 },
              { id: 2, name: 'Alumno 2', assistance: 2 },
              { id: 3, name: 'Alumno 3', assistance: 2 },
              { id: 4, name: 'Alumno 4', assistance: 1 },
              { id: 5, name: 'Alumno 5', assistance: 1 },
            ]
          },
        ]
      },
      {
        id: 2, name: 'Curso 2', dates: [
          {
            date: '2021-09-01', students: [
              { id: 6, name: 'Alumno 6', assistance: 1 },
              { id: 7, name: 'Alumno 7', assistance: 1 },
              { id: 8, name: 'Alumno 8', assistance: 2 },
              { id: 9, name: 'Alumno 9', assistance: 3 },
              { id: 10, name: 'Alumno 10', assistance: 1 },
            ]
          },
          {
            date: '2021-09-02', students: [
              { id: 6, name: 'Alumno 6', assistance: 1 },
              { id: 7, name: 'Alumno 7', assistance: 1 },
              { id: 8, name: 'Alumno 8', assistance: 2 },
              { id: 9, name: 'Alumno 9', assistance: 1 },
              { id: 10, name: 'Alumno 10', assistance: 1 },
            ]
          },
          {
            date: '2021-09-03', students: [
              { id: 6, name: 'Alumno 6', assistance: 1 },
              { id: 7, name: 'Alumno 7', assistance: 1 },
              { id: 8, name: 'Alumno 8', assistance: 2 },
              { id: 9, name: 'Alumno 9', assistance: 3 },
              { id: 10, name: 'Alumno 10', assistance: 4 },
            ]
          },
        ]
      }
    ];

  courseAssistanceByQuarter: {
    quarter: number, // 1,2,3
    courses: {
      id: number,
      name: string,
      dates: {
        date: string, // 'YYYY-MM-DD'
        students: {
          id: number,
          name: string,
          assistance: number,
          observation: string
        }[]
      }[]
    }[]
  }[] = [
      {
        quarter: 1, courses: [
          {
            id: 1, name: 'Curso 1', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 1, name: 'Alumno 1', assistance: 2, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 1, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 2, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 4, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 3, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 2, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 1, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
            ]
          },
          {
            id: 2, name: 'Curso 2', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 6' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 7' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 8' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 9' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 10' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 6' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 7' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 8' },
                  { id: 9, name: 'Alumno 9', assistance: 1, observation: 'Observación 9' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 10' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 6' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 7' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 8' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 9' },
                  { id: 10, name: 'Alumno 10', assistance: 4, observation: 'Observación 10' },
                ]
              },
            ]
          },
        ]
      },
      {
        quarter: 2, courses: [
          {
            id: 1, name: 'Curso 1', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 1, name: 'Alumno 1', assistance: 2, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 1, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 2, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 4, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 3, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 1' },
                  { id: 2, name: 'Alumno 2', assistance: 2, observation: 'Observación 2' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 3' },
                  { id: 4, name: 'Alumno 4', assistance: 1, observation: 'Observación 4' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
            ]
          },
          {
            id: 2, name: 'Curso 2', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 1, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 4, observation: 'Observación 5' },
                ]
              },
            ]
          },
        ]
      },
      {
        quarter: 3, courses: [
          {
            id: 1, name: 'Curso 1', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 1, name: 'Alumno 1', assistance: 2, observation: 'Observación 5' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 5' },
                  { id: 3, name: 'Alumno 3', assistance: 1, observation: 'Observación 5' },
                  { id: 4, name: 'Alumno 4', assistance: 2, observation: 'Observación 5' },
                  { id: 5, name: 'Alumno 5', assistance: 4, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 5' },
                  { id: 2, name: 'Alumno 2', assistance: 1, observation: 'Observación 5' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 5' },
                  { id: 4, name: 'Alumno 4', assistance: 3, observation: 'Observación 5' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 1, name: 'Alumno 1', assistance: 1, observation: 'Observación 5' },
                  { id: 2, name: 'Alumno 2', assistance: 2, observation: 'Observación 5' },
                  { id: 3, name: 'Alumno 3', assistance: 2, observation: 'Observación 5' },
                  { id: 4, name: 'Alumno 4', assistance: 1, observation: 'Observación 5' },
                  { id: 5, name: 'Alumno 5', assistance: 1, observation: 'Observación 5' },
                ]
              },
            ]
          },
          {
            id: 2, name: 'Curso 2', dates: [
              {
                date: '2021-09-01', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-02', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 1, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 1, observation: 'Observación 5' },
                ]
              },
              {
                date: '2021-09-03', students: [
                  { id: 6, name: 'Alumno 6', assistance: 1, observation: 'Observación 5' },
                  { id: 7, name: 'Alumno 7', assistance: 1, observation: 'Observación 5' },
                  { id: 8, name: 'Alumno 8', assistance: 2, observation: 'Observación 5' },
                  { id: 9, name: 'Alumno 9', assistance: 3, observation: 'Observación 5' },
                  { id: 10, name: 'Alumno 10', assistance: 4, observation: 'Observación 5' },
                ]
              },
            ]
          },
        ]
      },
    ]

  constructor(private http: HttpClient) { }

  getAllMyCourses():Observable<{
    courses: {
      id: number,
      name: string
    }[],
    currentQuarter: number
  }> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        courses: {
          id: number,
          name: string
        }[],
        currentQuarter: number
      }
    }>(`${environment.apiUrl}/My-courses`).pipe(
      map(response => response.body)
    );
  }

  getAllCoursesWithoutRegardlessOfPreceptor ():Observable<{
    courses: {
      id: number,
      name: string,
      isMine: boolean
    }[],
    currentQuarter: number
  }> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        courses: {
          id: number,
          name: string,
          isMine: boolean
        }[],
        currentQuarter: number
      }
    }>(`${environment.apiUrl}/all-courses`).pipe(
      map(response => response.body)
    );
  }

  getCurrentCourseAssistance(courseIDOrSSID: number, role:number):Observable<{
    id: number;
    name: string;
    schoolSubjectID?:number,
    groupID?:number,
    schoolSubjectName?:string,
    students: {
        id: number;
        name: string;
        assistance: number;
        file?: string;
        profilePic?:string|null;
        sex: string;
        tel: string;
        mail: string;
    }[];
  }> {
    const path = role == 3 ? 'view/subjects/detail' : 'course-assistance';
    const req = role == 3 ? `schoolSubjectID=${courseIDOrSSID}` : `courseID=${courseIDOrSSID}`;
    return this.http.get<{
      message:string,
      status:string,
      body:{
        id: number;
        name: string;
        schoolSubjectID?:number,
        groupID?:number,
        schoolSubjectName?:string,
        students: {
            id: number;
            name: string;
            assistance: number;
            sex: string;
            tel: string;
            mail: string;
        }[];
      }
    }>(`${environment.apiUrl}/${path}?${req}`).pipe(
      map(response => response.body)
    );
  }

  getCourseAssistanceByDate(courseID: number, date: string): Observable<{
    id: number;
    name: string;
    date:string;
    students: {
        id: number;
        name: string;
        assistance: number;
        isJust:boolean|null;
        obsJust:string|null;
    }[];
  }> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        id: number;
        name: string;
        students: {
            id: number;
            name: string;
            assistance: number;
            isJust:boolean|null;
            obsJust:string|null;
        }[];
      }
    }>(`${environment.apiUrl}/course-assistance-m?courseID=${courseID}&date=${date}`).pipe(
      map(response => {
        return { ...response.body, date }
      })
    );
  }

  getCourseAssistanceByDateAndSchoolSubjectID(params: {
    date: string,
    schoolSubjectID: number
  }): Observable<{
    id: number;
    name: string;
    date:string;
    schoolSubjectID?:number,
    groupID?:number,
    schoolSubjectName?:string,
    students: {
        id: number;
        name: string;
        assistance: number;
        isJust: boolean | null;
        obsJust: string | null;
    }[];
  }> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        id: number;
        name: string;
        schoolSubjectID?:number,
        groupID?:number,
        schoolSubjectName?:string,
        students: {
            id: number;
            name: string;
            assistance: number;
            isJust: boolean | null;
            obsJust: string | null;
        }[];
      }
    }>(`${environment.apiUrl}/view/subjects/detail?date=${params.date}&schoolSubjectID=${params.schoolSubjectID}`).pipe(
      map(response => {
        return { ...response.body, date: params.date }
      })
    );
  }

  getDatesFromCourse(courseID: number) {
    return this.courseAssistanceByDate.find(course => course.id === courseID)?.dates.map(d => d.date) || [];
  }

  setAssistance(assistanceToInsert: {
    assistance: number,
    courseID: number,
    studentID: number
  }) {
    return this.http.post(`${environment.apiUrl}/course-assistance`, assistanceToInsert);
  }

  setSubjectAssistance (assistanceToInsert: {
    assistance: number,
    courseID: number,
    studentID: number,
    schoolSubjectID: number,
    groupID: number
  }) {
    return this.http.post(`${environment.apiUrl}/course-assistance`, assistanceToInsert);
  }

  updateAssistance(assistanceToUpdate: {
    assistance: number,
    courseID: number,
    studentID: number,
    obs: string,
    date: string,
    schoolSubjectID?: number,
    groupID?: number;
    isJustified?:boolean|null;
    obsJust?:string|null;
  }) {
    return this.http.put(`${environment.apiUrl}/course-assistance`, assistanceToUpdate);
  }

  getLastModificationsFromCourseAndQuarter(courseID: number, quarter: number): Observable<{
    course: string,
    date: string,
    dateModification: string,
    assistance: number,
    observation: string,
    student: string,
    preceptor:string
  }[]> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        course: string,
        date: string,
        dateModification: string,
        assistance: number,
        observation: string,
        student: string,
        preceptor: string
      }[]
    }>(`${environment.apiUrl}/last-modifications?courseID=${courseID}&quarter=${quarter}`).pipe(
      map(response => response.body)
    );
  }

  getCoursesFilter():Observable<{
    courses: {
      id: number,
      name: string,
      isMine: boolean
    }[],
    currentQuarter: number
  }> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        courses: {
          id: number,
          name: string,
          isMine: boolean
        }[],
        currentQuarter: number
      }
    }>(`${environment.apiUrl}/all-courses`).pipe(
      map(response => response.body)
    );
  }

  getSchoolSubjectsFilter(): {
    id: number,
    name: string
  }[] {
    return [
      { id: 1, name: 'Materia 1' },
      { id: 2, name: 'Materia 2' },
    ];
  };

  getStudentsFilter(): {
    id: number,
    name: string
  }[] {
    return [
      { id: 1, name: 'Alumno 1' },
      { id: 2, name: 'Alumno 2' },
      { id: 3, name: 'Alumno 3' },
      { id: 4, name: 'Alumno 4' },
      { id: 5, name: 'Alumno 5' },
      { id: 6, name: 'Alumno 6' },
      { id: 7, name: 'Alumno 7' },
      { id: 8, name: 'Alumno 8' },
      { id: 9, name: 'Alumno 9' },
      { id: 10, name: 'Alumno 10' },
    ];
  }

  getYearsFilter(): number[] {
    return [
      2021,
      2020,
      2019,
      2018,
      2017
    ];
  }

  getFiltersByCourse(filtersByCourse: string[], courseID:number):Observable<{
    schoolSubjects?: {
      id: number,
      name: string
    }[];
    students?: {
      id: number,
      name: string
    }[];
    years?: number[];
  }> {
    const request = `courseID=${courseID}&filters=${filtersByCourse.join(',')}`;

    return this.http.get<{
      message:string,
      status:string,
      body:{
        schoolSubjects?: {
          id: number,
          name: string
        }[];
        students?: {
          id: number,
          name: string
        }[];
        years?: number[];
      }
    }>(`${environment.apiUrl}/filters?${request}`).pipe(
      map(response => response.body)
      );
  };

  getAssistanceReport(filters: {
    courseID: number,
    schoolSubjectID?: number,
    studentID?: number,
    year?: number,
    quarter?: number|string
  }):Observable<AssistanceReport[]> {
    const schoolSubject = filters.schoolSubjectID ? `&schoolSubjectID=${filters.schoolSubjectID}` : '';
    const student = filters.studentID ? `&studentID=${filters.studentID}` : '';
    const year = filters.year ? `&year=${filters.year}` : '';
    const quarter = filters.quarter ? `&quarter=${filters.quarter}` : '';
    
    const request = `courseID=${filters.courseID}` + schoolSubject + student + year + quarter;

    return this.http.get<{
      message:string,
      status:string,
      body:AssistanceReport[]
    }>(`${environment.apiUrl}/assistance-report?${request}`).pipe(
      map(response => response.body)
    );
  }

  getNonWorkingDates():Observable<{
    date: string,
    description: string
  }[]> {
    return this.http.get<{
      message:string,
      status:string,
      body:{
        date: string,
        description: string
      }[]
    }>(`${environment.apiUrl}/non-working-dates`).pipe(
      map(response => response.body)
    );
  }

  postNonWorkingDates(nonWorkingDates: {
    date: string,
    description: string
  }):Observable<{
    message:string,
      status:string
  }> {
    return this.http.post<{
      message:string,
      status:string
    }>(`${environment.apiUrl}/non-working-dates`, nonWorkingDates).pipe(
      map(response => response)
    );
  }

  delay(ms: number = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
