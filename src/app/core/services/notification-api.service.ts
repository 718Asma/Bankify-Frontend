import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly base = `${environment.apiUrl}/api/notifications`;

  private _notifications$ = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications$.asObservable();

  constructor(private http: HttpClient) {}

  // get unreadCount(): number {
  //   return this._notifications$.value.filter(n => !n.lu).length;
  // }

  /** Load notifications and store in observable */
  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.base).pipe(
      tap(list => this._notifications$.next(list))
    );
  }

  // /** Mark single notification as read */
  // markAsRead(id: number): Observable<void> {
  //   return this.http.patch<void>(`${this.base}/${id}/lu`, {}).pipe(
  //     tap(() => {
  //       const updated = this._notifications$.value.map(n =>
  //         n.id === id ? { ...n, lu: true } : n
  //       );
  //       this._notifications$.next(updated);
  //     })
  //   );
  // }

  // /** Mark all as read */
  // markAllAsRead(): Observable<void> {
  //   return this.http.patch<void>(`${this.base}/lu-tout`, {}).pipe(
  //     tap(() => {
  //       const updated = this._notifications$.value.map(n => ({ ...n, lu: true }));
  //       this._notifications$.next(updated);
  //     })
  //   );
  // }
}