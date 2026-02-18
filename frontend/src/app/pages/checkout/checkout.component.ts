import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem, Address } from '../../models/interfaces';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="checkout-page">
      <h1>📦 Checkout</h1>

      <!-- Step Indicator -->
      <div class="steps">
        <div class="step" [class.active]="currentStep >= 1" [class.done]="currentStep > 1">
          <span class="step-num">1</span> Address
        </div>
        <div class="step-line" [class.active]="currentStep > 1"></div>
        <div class="step" [class.active]="currentStep >= 2" [class.done]="currentStep > 2">
          <span class="step-num">2</span> Payment
        </div>
        <div class="step-line" [class.active]="currentStep > 2"></div>
        <div class="step" [class.active]="currentStep >= 3">
          <span class="step-num">3</span> Confirm
        </div>
      </div>

      <!-- Step 1: Address -->
      <div class="step-content" *ngIf="currentStep === 1">
        <h2>Delivery Address</h2>
        <div class="saved-addresses" *ngIf="savedAddresses.length > 0">
          <div class="address-card" *ngFor="let addr of savedAddresses; let i = index"
               [class.selected]="selectedAddressIndex === i" (click)="selectedAddressIndex = i">
            <div class="addr-radio"></div>
            <div>
              <strong>{{ addr.name }}</strong><br>
              {{ addr.street }}, {{ addr.city }} - {{ addr.pincode }}<br>
              Phone: {{ addr.phone }}
            </div>
          </div>
        </div>
        <h3>{{ savedAddresses.length > 0 ? 'Or add new address' : 'Add delivery address' }}</h3>
        <div class="address-form">
          <div class="form-row">
            <div class="form-group"><label>Full Name</label><input [(ngModel)]="newAddress.name" placeholder="Full Name"></div>
            <div class="form-group"><label>Phone</label><input [(ngModel)]="newAddress.phone" placeholder="Phone Number"></div>
          </div>
          <div class="form-group"><label>Street Address</label><input [(ngModel)]="newAddress.street" placeholder="House no, Building, Street"></div>
          <div class="form-row">
            <div class="form-group"><label>City</label><input [(ngModel)]="newAddress.city" placeholder="City"></div>
            <div class="form-group"><label>Pincode</label><input [(ngModel)]="newAddress.pincode" placeholder="Pincode"></div>
          </div>
        </div>
        <button class="next-btn" (click)="goToStep(2)" [disabled]="!isAddressValid()">Continue to Payment →</button>
      </div>

      <!-- Step 2: Payment -->
      <div class="step-content" *ngIf="currentStep === 2">
        <h2>Payment Method</h2>
        <div class="payment-options">
          <div class="payment-card" [class.selected]="paymentMethod === 'cod'" (click)="paymentMethod = 'cod'">
            <span class="pay-icon">💵</span>
            <div>
              <strong>Cash on Delivery</strong>
              <p>Pay when your order arrives</p>
            </div>
          </div>
          <div class="payment-card" [class.selected]="paymentMethod === 'online'" (click)="paymentMethod = 'online'">
            <span class="pay-icon">💳</span>
            <div>
              <strong>Online Payment</strong>
              <p>UPI, Credit/Debit Card, Net Banking</p>
            </div>
          </div>
        </div>
        <div class="step-nav">
          <button class="back-btn" (click)="goToStep(1)">← Back</button>
          <button class="next-btn" (click)="goToStep(3)">Review Order →</button>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div class="step-content" *ngIf="currentStep === 3">
        <h2>Order Summary</h2>
        <div class="confirm-grid">
          <div class="confirm-items">
            <div class="confirm-item" *ngFor="let item of cart?.items">
              <span class="ci-name">{{ item.product.name }} × {{ item.quantity }}</span>
              <span class="ci-price">₹{{ getItemPrice(item) * item.quantity }}</span>
            </div>
            <div class="confirm-totals">
              <div class="ct-row"><span>Subtotal</span><span>₹{{ subtotal }}</span></div>
              <div class="ct-row"><span>Delivery</span><span>{{ subtotal >= 500 ? 'FREE' : '₹40' }}</span></div>
              <div class="ct-row total"><span>Total</span><span>₹{{ grandTotal }}</span></div>
            </div>
          </div>
          <div class="confirm-info">
            <div class="info-block">
              <h4>📍 Delivery Address</h4>
              <p>{{ getSelectedAddress().name }}<br>{{ getSelectedAddress().street }}<br>{{ getSelectedAddress().city }} - {{ getSelectedAddress().pincode }}<br>📞 {{ getSelectedAddress().phone }}</p>
            </div>
            <div class="info-block">
              <h4>💳 Payment</h4>
              <p>{{ paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment' }}</p>
            </div>
          </div>
        </div>
        <div class="step-nav">
          <button class="back-btn" (click)="goToStep(2)">← Back</button>
          <button class="place-order-btn" (click)="placeOrder()" [disabled]="placing">
            {{ placing ? 'Placing Order...' : '🟢 Place Order' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .checkout-page { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; }
    .steps { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 2rem; }
    .step { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; color: #94a3b8; font-weight: 500; }
    .step.active { color: #1e293b; }
    .step.done { color: #22c55e; }
    .step-num { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e2e8f0; font-weight: 700; font-size: 0.85rem; }
    .step.active .step-num { background: #4ade80; color: white; }
    .step.done .step-num { background: #22c55e; color: white; }
    .step-line { width: 60px; height: 2px; background: #e2e8f0; }
    .step-line.active { background: #4ade80; }
    .step-content { background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 1.25rem; }
    h3 { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.25rem 0 1rem; }
    .saved-addresses { display: flex; flex-direction: column; gap: 0.75rem; }
    .address-card { display: flex; gap: 1rem; padding: 1rem; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: #4b5563; }
    .address-card.selected { border-color: #4ade80; background: #f0fdf4; }
    .addr-radio { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
    .address-card.selected .addr-radio { border-color: #4ade80; background: #4ade80; box-shadow: inset 0 0 0 4px white; }
    .address-form { display: flex; flex-direction: column; gap: 0.75rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .form-group input { padding: 0.7rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.3s; }
    .form-group input:focus { border-color: #4ade80; }
    .payment-options { display: flex; flex-direction: column; gap: 0.75rem; }
    .payment-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border: 1.5px solid #e2e8f0; border-radius: 14px; cursor: pointer; transition: all 0.2s; }
    .payment-card.selected { border-color: #4ade80; background: #f0fdf4; }
    .pay-icon { font-size: 2rem; }
    .payment-card strong { color: #1e293b; font-size: 1rem; }
    .payment-card p { color: #64748b; font-size: 0.85rem; margin: 0; }
    .step-nav { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .back-btn { padding: 0.75rem 1.5rem; border: 1.5px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; font-weight: 500; transition: all 0.3s; }
    .back-btn:hover { border-color: #4ade80; }
    .next-btn { flex: 1; padding: 0.85rem; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-size: 1rem; margin-top: 1.5rem; }
    .next-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .next-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .confirm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .confirm-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .ci-price { font-weight: 600; }
    .confirm-totals { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 2px solid #f1f5f9; }
    .ct-row { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 0.9rem; color: #4b5563; }
    .ct-row.total { font-size: 1.15rem; font-weight: 700; color: #1e293b; padding-top: 0.5rem; }
    .info-block { background: #f8fafc; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
    .info-block h4 { font-size: 0.9rem; color: #1e293b; margin-bottom: 0.5rem; }
    .info-block p { font-size: 0.85rem; color: #4b5563; line-height: 1.5; margin: 0; }
    .place-order-btn { flex: 1; padding: 0.9rem; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1.05rem; transition: all 0.3s; }
    .place-order-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .place-order-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 768px) { .confirm-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent implements OnInit {
    currentStep = 1;
    cart: Cart | null = null;
    savedAddresses: Address[] = [];
    selectedAddressIndex = -1;
    paymentMethod = 'cod';
    placing = false;
    newAddress: Address = { name: '', phone: '', street: '', city: '', pincode: '', isDefault: false };

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.cartService.cart$.subscribe(cart => this.cart = cart);
        this.cartService.loadCart();
        this.savedAddresses = this.authService.currentUser?.addresses || [];
        if (this.savedAddresses.length > 0) this.selectedAddressIndex = 0;
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

    getSelectedAddress(): Address {
        if (this.selectedAddressIndex >= 0 && this.selectedAddressIndex < this.savedAddresses.length) {
            return this.savedAddresses[this.selectedAddressIndex];
        }
        return this.newAddress;
    }

    isAddressValid(): boolean {
        if (this.selectedAddressIndex >= 0) return true;
        const a = this.newAddress;
        return !!(a.name && a.phone && a.street && a.city && a.pincode);
    }

    goToStep(step: number) {
        if (step === 2 && !this.isAddressValid()) return;
        this.currentStep = step;
    }

    placeOrder() {
        this.placing = true;
        const address = this.getSelectedAddress();
        this.orderService.placeOrder({ address, paymentMethod: this.paymentMethod }).subscribe({
            next: (order) => {
                this.placing = false;
                this.router.navigate(['/order-success', order._id]);
            },
            error: () => { this.placing = false; }
        });
    }
}
