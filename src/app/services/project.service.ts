import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../interfaces/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  getProjects(page: number = 1): Observable<any> {
    return this.http.get(`${environment.apiUrl}/projects?page=${page}`);
  }

  getProject(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/projects/${id}`);
  }

  createProject(project: Partial<Project>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/projects`, project);
  }

  updateProject(id: number, project: Partial<Project>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/projects/${id}`, project);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/projects/${id}`);
  }
}