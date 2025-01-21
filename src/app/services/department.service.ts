import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Department } from '../interfaces/department.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getDepartments(page: number = 1): Observable<any> {
    return this.http.get(`${environment.apiUrl}/departments?page=${page}`);
  }

  getDepartment(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/departments/${id}`);
  }

  createDepartment(department: Partial<Department>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/departments`, department);
  }

  updateDepartment(id: number, department: Partial<Department>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/departments/${id}`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/departments/${id}`);
  }
}