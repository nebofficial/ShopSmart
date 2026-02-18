import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
    private apiUrl = `${environment.apiUrl}/cart`;
    private cartSubject = new BehaviorSubject<Cart | null>(null);
    cart$ = this.cartSubject.asObservable();

    constructor(private http: HttpClient) { }

    get cartItemCount(): number {
        const cart = this.cartSubject.value;
        return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    }

    loadCart(): void {
        this.http.get<Cart>(this.apiUrl).subscribe({
            next: cart => this.cartSubject.next(cart),
            error: () => this.cartSubject.next(null)
        });
    }

    addToCart(productId: string, quantity: number = 1): Observable<Cart> {
        return this.http.post<Cart>(`${this.apiUrl}/add`, { productId, quantity }).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    updateQuantity(productId: string, quantity: number): Observable<Cart> {
        return this.http.put<Cart>(`${this.apiUrl}/update`, { productId, quantity }).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    removeItem(productId: string): Observable<Cart> {
        return this.http.delete<Cart>(`${this.apiUrl}/remove/${productId}`).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    clearCart(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/clear`).pipe(
            tap(() => this.cartSubject.next(null))
        );
    }
}
