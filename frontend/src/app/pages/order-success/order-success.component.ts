import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/interfaces';

@Component({
    selector: 'app-order-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="success-page" *ngIf="order">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p class="success-msg">Thank you for shopping with ShopSmart</p>

        <div class="order-info">
          <div class="info-item">
            <span class="info-label">Order ID</span>
            <span class="info-value">#{{ order._id.slice(-6).toUpperCase() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Amount</span>
            <span class="info-value">₹{{ order.total }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Payment</span>
            <span class="info-value">{{ order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estimated Delivery</span>
            <span class="info-value delivery">🚚 Tomorrow by 8 PM</span>
          </div>
        </div>

        <div class="order-items">
          <h3>Items Ordered</h3>
          <div class="ordered-item" *ngFor="let item of order.items">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>₹{{ item.price * item.quantity }}</span>
          </div>
        </div>

        <div class="success-actions">
          <a routerLink="/dashboard/orders" class="track-btn">📋 Track Order</a>
          <a routerLink="/shop" class="continue-btn">🛍️ Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .success-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .success-card { background: white; border-radius: 24px; padding: 3rem; max-width: 550px; width: 100%; text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
    .success-icon { font-size: 4rem; margin-bottom: 1rem; animation: bounce 0.6s ease; }
    @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    h1 { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; font-family: 'Outfit', sans-serif; }
    .success-msg { color: #64748b; font-size: 0.95rem; margin-bottom: 2rem; }
    .order-info { background: #f8fafc; border-radius: 16px; padding: 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; text-align: left; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .info-value { font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 0.2rem; }
    .info-value.delivery { color: #4ade80; }
    .order-items { text-align: left; margin-bottom: 1.5rem; }
    .order-items h3 { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; }
    .ordered-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #4b5563; }
    .ordered-item span:last-child { font-weight: 600; color: #1e293b; }
    .success-actions { display: flex; gap: 1rem; }
    .track-btn, .continue-btn { flex: 1; padding: 0.85rem; border-radius: 12px; text-decoration: none; font-weight: 700; text-align: center; transition: all 0.3s; font-size: 0.95rem; }
    .track-btn { background: linear-gradient(135deg, #4ade80, #22c55e); color: white; }
    .track-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .continue-btn { border: 2px solid #e2e8f0; color: #64748b; }
    .continue-btn:hover { border-color: #4ade80; color: #4ade80; }
  `]
})
export class OrderSuccessComponent implements OnInit {
    order: Order | null = null;

    constructor(private route: ActivatedRoute, private orderService: OrderService) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.orderService.getOrder(params['id']).subscribe(order => this.order = order);
        });
    }
}
