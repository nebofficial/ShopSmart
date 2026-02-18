import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const user = localStorage.getItem('user');
        if (user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    get isAdmin(): boolean {
        return this.currentUser?.role === 'admin';
    }

    get token(): string | null {
        return this.currentUser?.token || null;
    }

    register(data: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, data).pipe(
            tap(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    login(data: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, data).pipe(
            tap(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    updateProfile(data: any): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
            tap(user => {
                const current = this.currentUser;
                const updated = { ...current, ...user };
                localStorage.setItem('user', JSON.stringify(updated));
                this.currentUserSubject.next(updated as User);
            })
        );
    }

    changePassword(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/change-password`, data);
    }

    addAddress(address: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/address`, address);
    }

    deleteAddress(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/address/${id}`);
    }

    getCustomers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/customers`);
    }

    updateCustomerStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/customers/${id}/status`, { status });
    }

    deleteCustomer(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/customers/${id}`);
    }
}
