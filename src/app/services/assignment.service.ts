import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Assignment } from '../interfaces/assignment.interface';

@Injectable({
    providedIn: 'root'
  })
  export class AssignmentService {
    constructor(private http: HttpClient) {}
  
    getAssignments(page: number = 1): Observable<any> {
      return this.http.get(`${environment.apiUrl}/project_assignments?page=${page}`);
    }
  
    getAssignment(id: number): Observable<any> {
      return this.http.get(`${environment.apiUrl}/project_assignments/${id}`);
    }
  
    createAssignment(projectAssignment: Partial<Assignment>): Observable<any> {
      return this.http.post(`${environment.apiUrl}/project_assignments`, projectAssignment);
    }
  
    updateAssignment(id: number, projectAssignment: Partial<Assignment>): Observable<any> {
      return this.http.put(`${environment.apiUrl}/project_assignments/${id}`, projectAssignment);
    }
  
    deleteAssignment(id: number): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/project_assignments/${id}`);
    }
  }
  