import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/interfaces';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="cart-page">
      <h1>🛒 Shopping Cart</h1>

      <div class="empty-cart" *ngIf="!cart || cart.items.length === 0">
        <span class="empty-icon">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add some fresh groceries to get started!</p>
        <a routerLink="/shop" class="shop-btn">Browse Products</a>
      </div>

      <div class="cart-layout" *ngIf="cart && cart.items.length > 0">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cart.items; trackBy: trackByFn">
            <div class="item-image">{{ getEmoji(item) }}</div>
            <div class="item-details">
              <a [routerLink]="['/product', item.product._id]" class="item-name">{{ item.product.name }}</a>
              <span class="item-weight">{{ item.product.weight }}</span>
              <span class="item-price">₹{{ getItemPrice(item) }} each</span>
            </div>
            <div class="item-qty">
              <button (click)="updateQty(item, item.quantity - 1)" [disabled]="item.quantity <= 1">−</button>
              <span>{{ item.quantity }}</span>
              <button (click)="updateQty(item, item.quantity + 1)">+</button>
            </div>
            <div class="item-total">₹{{ getItemPrice(item) * item.quantity }}</div>
            <button class="remove-btn" (click)="removeItem(item)">🗑️</button>
          </div>
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal ({{ totalItems }} items)</span>
            <span>₹{{ subtotal }}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span [class.free]="subtotal >= 500">{{ subtotal >= 500 ? 'FREE' : '₹40' }}</span>
          </div>
          <div class="summary-row discount" *ngIf="subtotal >= 500">
            <span>🎉 Free delivery on orders ₹500+</span>
          </div>
          <div class="summary-total">
            <span>Grand Total</span>
            <span>₹{{ grandTotal }}</span>
          </div>
          <a routerLink="/checkout" class="checkout-btn">Proceed to Checkout →</a>
          <a routerLink="/shop" class="continue-btn">← Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .cart-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; }
    .empty-cart { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 5rem; display: block; margin-bottom: 1rem; }
    .empty-cart h2 { font-size: 1.5rem; color: #1e293b; margin-bottom: 0.5rem; }
    .empty-cart p { color: #64748b; margin-bottom: 1.5rem; }
    .shop-btn { display: inline-block; background: #4ade80; color: #1e293b; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; }
    .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 1rem; }
    .cart-item { display: flex; align-items: center; gap: 1rem; background: white; padding: 1.25rem; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f1f5f9; transition: all 0.3s; }
    .cart-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .item-image { width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; background: #f0fdf4; border-radius: 12px; flex-shrink: 0; }
    .item-details { flex: 1; }
    .item-name { display: block; font-weight: 600; color: #1e293b; text-decoration: none; font-size: 1rem; margin-bottom: 0.15rem; }
    .item-name:hover { color: #4ade80; }
    .item-weight { display: block; font-size: 0.8rem; color: #94a3b8; }
    .item-price { display: block; font-size: 0.85rem; color: #64748b; }
    .item-qty { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .item-qty button { width: 32px; height: 32px; border: none; background: #f8fafc; cursor: pointer; font-size: 1rem; font-weight: 600; }
    .item-qty button:hover { background: #e2e8f0; }
    .item-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
    .item-qty span { width: 36px; text-align: center; font-weight: 600; }
    .item-total { font-weight: 700; font-size: 1.05rem; color: #1e293b; min-width: 70px; text-align: right; }
    .remove-btn { border: none; background: none; cursor: pointer; font-size: 1.1rem; padding: 0.4rem; border-radius: 8px; transition: background 0.2s; }
    .remove-btn:hover { background: #fef2f2; }
    .cart-summary { background: white; border-radius: 20px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f1f5f9; position: sticky; top: 80px; }
    .cart-summary h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 1.25rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.6rem 0; font-size: 0.95rem; color: #4b5563; }
    .summary-row .free { color: #22c55e; font-weight: 600; }
    .summary-row.discount { font-size: 0.8rem; color: #22c55e; justify-content: center; }
    .summary-total { display: flex; justify-content: space-between; padding: 1rem 0; margin-top: 0.5rem; border-top: 2px solid #f1f5f9; font-size: 1.15rem; font-weight: 700; color: #1e293b; }
    .checkout-btn { display: block; text-align: center; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 0.85rem; border-radius: 12px; font-weight: 700; text-decoration: none; margin-top: 1rem; transition: all 0.3s; font-size: 1rem; }
    .checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .continue-btn { display: block; text-align: center; color: #64748b; padding: 0.6rem; font-size: 0.9rem; text-decoration: none; margin-top: 0.5rem; }
    .continue-btn:hover { color: #4ade80; }
    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
      .item-total { order: 5; width: 100%; text-align: left; }
    }
  `]
})
export class CartComponent implements OnInit {
    cart: Cart | null = null;

    constructor(private cartService: CartService) { }

    ngOnInit() {
        this.cartService.cart$.subscribe(cart => this.cart = cart);
        this.cartService.loadCart();
    }

    get totalItems(): number {
        return this.cart?.items.reduce((s, i) => s + i.quantity, 0) || 0;
    }

    get subtotal(): number {
        return this.cart?.items.reduce((s, i) => s + this.getItemPrice(i) * i.quantity, 0) || 0;
    }

    get grandTotal(): number {
        return this.subtotal + (this.subtotal >= 500 ? 0 : 40);
    }

    getItemPrice(item: CartItem): number {
        const p = item.product;
        if (p.discount > 0) return Math.round(p.price - (p.price * p.discount / 100));
        return p.price;
    }

    getEmoji(item: CartItem): string {
        const cat = item.product.category as any;
        return cat?.image || '📦';
    }

    updateQty(item: CartItem, qty: number) {
        this.cartService.updateQuantity(item.product._id, qty).subscribe();
    }

    removeItem(item: CartItem) {
        this.cartService.removeItem(item.product._id).subscribe();
    }

    trackByFn(index: number, item: CartItem) {
        return item.product._id;
    }
}
