import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order, User, Address } from '../../models/interfaces';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="dashboard-page">
      <div class="dash-layout">
        <aside class="dash-sidebar">
          <div class="user-card">
            <div class="user-avatar">{{ user?.name?.charAt(0) || 'U' }}</div>
            <h3>{{ user?.name }}</h3>
            <p>{{ user?.email }}</p>
          </div>
          <nav class="dash-nav">
            <a (click)="activeTab = 'profile'" [class.active]="activeTab === 'profile'">👤 My Profile</a>
            <a (click)="activeTab = 'orders'" [class.active]="activeTab === 'orders'">📋 My Orders</a>
            <a (click)="activeTab = 'addresses'" [class.active]="activeTab === 'addresses'">📍 Addresses</a>
            <a (click)="activeTab = 'password'" [class.active]="activeTab === 'password'">🔒 Change Password</a>
            <a (click)="logout()" class="logout-link">🚪 Logout</a>
          </nav>
        </aside>

        <main class="dash-content">
          <!-- Profile -->
          <div *ngIf="activeTab === 'profile'" class="tab-content">
            <h2>My Profile</h2>
            <div class="profile-form">
              <div class="form-group"><label>Name</label><input [(ngModel)]="profileData.name"></div>
              <div class="form-group"><label>Email</label><input [(ngModel)]="profileData.email" readonly></div>
              <div class="form-group"><label>Phone</label><input [(ngModel)]="profileData.phone"></div>
              <button class="save-btn" (click)="updateProfile()">Save Changes</button>
              <div class="success-msg" *ngIf="profileMsg">{{ profileMsg }}</div>
            </div>
          </div>

          <!-- Orders -->
          <div *ngIf="activeTab === 'orders'" class="tab-content">
            <h2>My Orders</h2>
            <div class="orders-list">
              <div class="order-card" *ngFor="let order of orders" (click)="selectedOrder = selectedOrder?._id === order._id ? null : order">
                <div class="order-header">
                  <span class="order-id">#{{ order._id.slice(-6).toUpperCase() }}</span>
                  <span class="order-status" [attr.data-status]="order.status">{{ order.status }}</span>
                </div>
                <div class="order-meta">
                  <span>{{ order.items.length }} items</span>
                  <span>₹{{ order.total }}</span>
                  <span>{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <!-- Track Order -->
                <div class="track-section" *ngIf="selectedOrder?._id === order._id">
                  <div class="track-bar">
                    <div class="track-step" [class.done]="isStepDone(order, 'Ordered')"><span>📝</span>Ordered</div>
                    <div class="track-line" [class.done]="isStepDone(order, 'Packed')"></div>
                    <div class="track-step" [class.done]="isStepDone(order, 'Packed')"><span>📦</span>Packed</div>
                    <div class="track-line" [class.done]="isStepDone(order, 'Shipped')"></div>
                    <div class="track-step" [class.done]="isStepDone(order, 'Shipped')"><span>🚚</span>Shipped</div>
                    <div class="track-line" [class.done]="isStepDone(order, 'Delivered')"></div>
                    <div class="track-step" [class.done]="isStepDone(order, 'Delivered')"><span>✅</span>Delivered</div>
                  </div>
                  <div class="order-items-list">
                    <div class="oi" *ngFor="let item of order.items">
                      <span>{{ item.name }} × {{ item.quantity }}</span>
                      <span>₹{{ item.price * item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty" *ngIf="orders.length === 0">
                <p>No orders yet. <a routerLink="/shop">Start shopping!</a></p>
              </div>
            </div>
          </div>

          <!-- Addresses -->
          <div *ngIf="activeTab === 'addresses'" class="tab-content">
            <h2>My Addresses</h2>
            <div class="address-list">
              <div class="addr-card" *ngFor="let addr of user?.addresses">
                <strong>{{ addr.name }}</strong><br>
                {{ addr.street }}<br>{{ addr.city }} - {{ addr.pincode }}<br>📞 {{ addr.phone }}
                <button class="delete-addr" (click)="deleteAddress(addr._id!)">✕</button>
              </div>
            </div>
            <h3>Add New Address</h3>
            <div class="address-form">
              <div class="form-row">
                <div class="form-group"><label>Name</label><input [(ngModel)]="newAddr.name"></div>
                <div class="form-group"><label>Phone</label><input [(ngModel)]="newAddr.phone"></div>
              </div>
              <div class="form-group"><label>Street</label><input [(ngModel)]="newAddr.street"></div>
              <div class="form-row">
                <div class="form-group"><label>City</label><input [(ngModel)]="newAddr.city"></div>
                <div class="form-group"><label>Pincode</label><input [(ngModel)]="newAddr.pincode"></div>
              </div>
              <button class="save-btn" (click)="addAddress()">Add Address</button>
            </div>
          </div>

          <!-- Password -->
          <div *ngIf="activeTab === 'password'" class="tab-content">
            <h2>Change Password</h2>
            <div class="profile-form">
              <div class="form-group"><label>Current Password</label><input type="password" [(ngModel)]="pwData.currentPassword"></div>
              <div class="form-group"><label>New Password</label><input type="password" [(ngModel)]="pwData.newPassword"></div>
              <button class="save-btn" (click)="changePassword()">Update Password</button>
              <div class="success-msg" *ngIf="pwMsg">{{ pwMsg }}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .dash-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
    .dash-sidebar { background: white; border-radius: 20px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 80px; }
    .user-card { text-align: center; padding-bottom: 1rem; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
    .user-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; margin: 0 auto 0.75rem; }
    .user-card h3 { font-size: 1.05rem; color: #1e293b; margin: 0; }
    .user-card p { font-size: 0.8rem; color: #94a3b8; margin: 0; }
    .dash-nav a { display: block; padding: 0.7rem 1rem; border-radius: 10px; color: #4b5563; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; text-decoration: none; margin-bottom: 0.25rem; }
    .dash-nav a:hover, .dash-nav a.active { background: #f0fdf4; color: #16a34a; font-weight: 600; }
    .logout-link { color: #ef4444 !important; }
    .dash-content { min-height: 500px; }
    .tab-content { background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; }
    h3 { font-size: 1.05rem; font-weight: 600; color: #374151; margin: 1.5rem 0 1rem; }
    .profile-form, .address-form { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .form-group input { padding: 0.7rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; }
    .form-group input:focus { border-color: #4ade80; }
    .form-group input[readonly] { background: #f8fafc; color: #94a3b8; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .save-btn { padding: 0.75rem 2rem; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; width: fit-content; }
    .save-btn:hover { transform: translateY(-1px); }
    .success-msg { color: #22c55e; font-size: 0.85rem; font-weight: 500; }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: #f8fafc; border-radius: 14px; padding: 1.25rem; cursor: pointer; transition: all 0.2s; border: 1px solid #f1f5f9; }
    .order-card:hover { border-color: #4ade80; }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .order-id { font-weight: 700; color: #1e293b; }
    .order-status { padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; background: #e2e8f0; color: #475569; }
    .order-status[data-status="Delivered"] { background: #dcfce7; color: #16a34a; }
    .order-status[data-status="Shipped"] { background: #dbeafe; color: #2563eb; }
    .order-status[data-status="Pending"] { background: #fef3c7; color: #d97706; }
    .order-status[data-status="Cancelled"] { background: #fef2f2; color: #dc2626; }
    .order-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #64748b; }
    .track-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .track-bar { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 1rem; }
    .track-step { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
    .track-step.done { color: #22c55e; }
    .track-step span { font-size: 1.3rem; }
    .track-line { width: 40px; height: 2px; background: #e2e8f0; }
    .track-line.done { background: #22c55e; }
    .oi { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.85rem; color: #4b5563; }
    .address-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .addr-card { background: #f8fafc; padding: 1rem; border-radius: 12px; font-size: 0.85rem; color: #4b5563; line-height: 1.5; position: relative; }
    .delete-addr { position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; color: #ef4444; }
    .empty { text-align: center; padding: 2rem; color: #64748b; }
    .empty a { color: #4ade80; }
    @media (max-width: 768px) { .dash-layout { grid-template-columns: 1fr; } .dash-sidebar { position: static; } }
  `]
})
export class DashboardComponent implements OnInit {
    activeTab = 'profile';
    user: User | null = null;
    orders: Order[] = [];
    selectedOrder: Order | null = null;
    profileData = { name: '', email: '', phone: '' };
    profileMsg = '';
    pwData = { currentPassword: '', newPassword: '' };
    pwMsg = '';
    newAddr: Address = { name: '', phone: '', street: '', city: '', pincode: '', isDefault: false };

    private statusOrder = ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

    constructor(private authService: AuthService, private orderService: OrderService) { }

    ngOnInit() {
        this.user = this.authService.currentUser;
        if (this.user) {
            this.profileData = { name: this.user.name, email: this.user.email, phone: this.user.phone };
        }
        this.orderService.getMyOrders().subscribe(orders => this.orders = orders);
    }

    isStepDone(order: Order, step: string): boolean {
        const map: any = { 'Ordered': 'Pending', 'Packed': 'Packed', 'Shipped': 'Shipped', 'Delivered': 'Delivered' };
        const statusVal = map[step] || step;
        return this.statusOrder.indexOf(order.status) >= this.statusOrder.indexOf(statusVal);
    }

    updateProfile() {
        this.authService.updateProfile(this.profileData).subscribe({
            next: () => { this.profileMsg = 'Profile updated!'; setTimeout(() => this.profileMsg = '', 3000); },
            error: () => { this.profileMsg = 'Update failed'; }
        });
    }

    changePassword() {
        this.authService.changePassword(this.pwData).subscribe({
            next: () => { this.pwMsg = 'Password updated!'; this.pwData = { currentPassword: '', newPassword: '' }; setTimeout(() => this.pwMsg = '', 3000); },
            error: (err) => { this.pwMsg = err.error?.message || 'Failed'; }
        });
    }

    addAddress() {
        this.authService.addAddress(this.newAddr).subscribe(addrs => {
            if (this.user) this.user.addresses = addrs;
            this.newAddr = { name: '', phone: '', street: '', city: '', pincode: '', isDefault: false };
        });
    }

    deleteAddress(id: string) {
        this.authService.deleteAddress(id).subscribe(addrs => {
            if (this.user) this.user.addresses = addrs;
        });
    }

    logout() {
        this.authService.logout();
        window.location.href = '/';
    }
}
