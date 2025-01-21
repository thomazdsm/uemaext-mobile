import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Activity } from '../interfaces/activity.interface';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  constructor(private http: HttpClient) {}

  getActivities(page: number = 1): Observable<any> {
    return this.http.get(`${environment.apiUrl}/activities?page=${page}`);
  }

  getActivity(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/activities/${id}`);
  }

  createActivity(activity: Partial<Activity>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/activities`, activity);
  }

  updateActivity(id: number, activity: Partial<Activity>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/activities/${id}`, activity);
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/activities/${id}`);
  }
}
