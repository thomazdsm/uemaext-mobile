import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Report } from '../interfaces/report.interface';

@Injectable({
    providedIn: 'root'
  })
  export class ReportService {
    constructor(private http: HttpClient) {}
  
    getReports(page: number = 1): Observable<any> {
      return this.http.get(`${environment.apiUrl}/reports?page=${page}`);
    }
  
    getReport(id: number): Observable<any> {
      return this.http.get(`${environment.apiUrl}/reports/${id}`);
    }
  
    createReport(report: Partial<Report>): Observable<any> {
      return this.http.post(`${environment.apiUrl}/reports`, report);
    }
  
    updateReport(id: number, report: Partial<Report>): Observable<any> {
      return this.http.put(`${environment.apiUrl}/reports/${id}`, report);
    }
  
    deleteReport(id: number): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/reports/${id}`);
    }
  }