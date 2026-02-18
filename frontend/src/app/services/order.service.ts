import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderResponse, Report } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    placeOrder(data: any): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, data);
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/myorders`);
    }

    getOrder(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    getAllOrders(filters: any = {}): Observable<OrderResponse> {
        let params = new HttpParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params = params.set(key, filters[key]);
        });
        return this.http.get<OrderResponse>(this.apiUrl, { params });
    }

    updateOrderStatus(id: string, status: string): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
    }

    getReports(): Observable<Report> {
        return this.http.get<Report>(`${this.apiUrl}/admin/reports`);
    }
}
