import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { OrderService } from '../services/order.service';
import { Product, Category, Order, User, Report } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-page">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span>🛒</span> Shop<span class="hl">Smart</span>
          <small>Admin Panel</small>
        </div>
        <nav>
          <a (click)="tab='dashboard'" [class.active]="tab==='dashboard'">📊 Dashboard</a>
          <a (click)="tab='products'" [class.active]="tab==='products'">📦 Products</a>
          <a (click)="tab='categories'" [class.active]="tab==='categories'">🏷️ Categories</a>
          <a (click)="tab='orders'" [class.active]="tab==='orders'">📋 Orders</a>
          <a (click)="tab='customers'" [class.active]="tab==='customers'">👥 Customers</a>
          <a (click)="tab='reports'" [class.active]="tab==='reports'">📈 Reports</a>
          <a (click)="tab='settings'" [class.active]="tab==='settings'">⚙️ Settings</a>
          <a (click)="logout()" class="logout-link">🚪 Logout</a>
        </nav>
      </aside>

      <main class="admin-main">
        <!-- Dashboard -->
        <div *ngIf="tab==='dashboard'" class="admin-content">
          <h1>Dashboard Overview</h1>
          <div class="stat-cards">
            <div class="stat-card"><span class="stat-icon bg-green">📦</span><div><p class="stat-num">{{ stats.products }}</p><p class="stat-label">Total Products</p></div></div>
            <div class="stat-card"><span class="stat-icon bg-blue">📋</span><div><p class="stat-num">{{ stats.orders }}</p><p class="stat-label">Total Orders</p></div></div>
            <div class="stat-card"><span class="stat-icon bg-yellow">⏳</span><div><p class="stat-num">{{ stats.pending }}</p><p class="stat-label">Pending Orders</p></div></div>
            <div class="stat-card"><span class="stat-icon bg-purple">💰</span><div><p class="stat-num">₹{{ stats.revenue | number }}</p><p class="stat-label">Total Revenue</p></div></div>
            <div class="stat-card"><span class="stat-icon bg-teal">👥</span><div><p class="stat-num">{{ stats.customers }}</p><p class="stat-label">Total Customers</p></div></div>
            <div class="stat-card"><span class="stat-icon bg-red">⚠️</span><div><p class="stat-num">{{ stats.lowStock }}</p><p class="stat-label">Low Stock Items</p></div></div>
          </div>
          <div class="dashboard-charts">
            <div class="chart-card">
              <h3>📊 Sales Trend (Last 7 Days)</h3>
              <div class="simple-chart">
                <div class="chart-bar" *ngFor="let d of report?.dailyRevenue" [style.height.%]="getBarHeight(d.revenue)">
                  <span class="bar-val">₹{{ d.revenue }}</span>
                  <span class="bar-label">{{ d._id.slice(5) }}</span>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <h3>🔥 Top Selling Products</h3>
              <div class="top-list">
                <div class="top-item" *ngFor="let p of report?.topProducts; let i = index">
                  <span class="top-rank">#{{ i + 1 }}</span>
                  <span class="top-name">{{ p._id }}</span>
                  <span class="top-sold">{{ p.totalSold }} sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div *ngIf="tab==='products'" class="admin-content">
          <div class="content-header">
            <h1>Products</h1>
            <button class="primary-btn" (click)="showProductForm = !showProductForm">{{ showProductForm ? 'Cancel' : '+ Add Product' }}</button>
          </div>
          <div class="product-form-card" *ngIf="showProductForm">
            <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
            <div class="pf-grid">
              <div class="form-group"><label>Name</label><input [(ngModel)]="pForm.name"></div>
              <div class="form-group"><label>Category</label>
                <select [(ngModel)]="pForm.category">
                  <option value="">Select</option>
                  <option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Price (₹)</label><input type="number" [(ngModel)]="pForm.price"></div>
              <div class="form-group"><label>Discount (%)</label><input type="number" [(ngModel)]="pForm.discount"></div>
              <div class="form-group"><label>Stock</label><input type="number" [(ngModel)]="pForm.stock"></div>
              <div class="form-group"><label>Weight</label><input [(ngModel)]="pForm.weight"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea [(ngModel)]="pForm.description" rows="3"></textarea></div>
            <div class="form-group"><label>Nutrition</label><input [(ngModel)]="pForm.nutrition"></div>
            <div class="form-group">
              <label>Product Image</label>
              <div class="image-upload-zone" (click)="imageInput.click()" (dragover)="$event.preventDefault()" (drop)="onImageDrop($event)">
                <input #imageInput type="file" accept="image/*" (change)="onImageSelected($event)" style="display:none">
                <div *ngIf="!imagePreview && !editingProduct?.image" class="upload-placeholder">
                  <span class="upload-icon">📁</span>
                  <p>Click or drag an image here</p>
                  <small>JPG, PNG, WebP — Max 5MB</small>
                </div>
                <img *ngIf="imagePreview" [src]="imagePreview" class="image-preview">
                <img *ngIf="!imagePreview && editingProduct?.image" [src]="getImageUrl(editingProduct!.image)" class="image-preview">
              </div>
              <button *ngIf="imagePreview || selectedFile" class="remove-img-btn" (click)="clearImage($event)">✕ Remove image</button>
            </div>
            <div class="form-actions">
              <button class="save-btn" (click)="saveProduct()">{{ editingProduct ? 'Update' : 'Save' }} Product</button>
            </div>
          </div>
          <div class="search-row"><input placeholder="Search products..." [(ngModel)]="productSearch" (input)="loadProducts()"></div>
          <div class="data-table">
            <table>
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let p of products" [class.low-stock]="p.stock < 5">
                  <td><img *ngIf="p.image" [src]="getImageUrl(p.image)" class="product-thumb"><span *ngIf="!p.image" class="no-img">📷</span></td>
                  <td><strong>{{ p.name }}</strong></td>
                  <td>{{ getCatName(p) }}</td>
                  <td>₹{{ p.price }}</td>
                  <td [class.danger]="p.stock < 5">{{ p.stock }}</td>
                  <td><span class="badge" [class.green]="p.status==='available'" [class.red]="p.status==='unavailable'">{{ p.status }}</span></td>
                  <td><button class="action-btn edit" (click)="editProduct(p)">✏️</button><button class="action-btn delete" (click)="deleteProduct(p._id)">🗑️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Categories -->
        <div *ngIf="tab==='categories'" class="admin-content">
          <div class="content-header"><h1>Categories</h1></div>
          <div class="cat-form">
            <div class="cat-icon-picker">
              <label>Icon</label>
              <input placeholder="Emoji e.g. 🍎" [(ngModel)]="newCatIcon" class="icon-input" maxlength="4">
            </div>
            <input placeholder="Category name" [(ngModel)]="newCatName">
            <button class="primary-btn" (click)="addCategory()">{{ editingCategory ? 'Update' : 'Add' }} Category</button>
            <button *ngIf="editingCategory" class="cancel-btn" (click)="cancelCatEdit()">Cancel</button>
          </div>
          <div class="data-table">
            <table>
              <thead><tr><th>Icon</th><th>Name</th><th>Products</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let c of categories">
                  <td class="cat-icon-cell">{{ c.image || '📂' }}</td>
                  <td><strong>{{ c.name }}</strong></td>
                  <td>{{ c.productCount }}</td>
                  <td>
                    <button class="action-btn edit" (click)="editCat(c)">✏️</button>
                    <button class="action-btn delete" (click)="deleteCategory(c._id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Orders -->
        <div *ngIf="tab==='orders'" class="admin-content">
          <div class="content-header">
            <h1>Orders</h1>
            <select [(ngModel)]="orderFilter" (change)="loadOrders()" class="filter-select">
              <option value="">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="data-table">
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let o of allOrders">
                  <td><strong>#{{ o._id.slice(-6).toUpperCase() }}</strong></td>
                  <td>{{ getCustomerName(o) }}</td>
                  <td>{{ o.createdAt | date:'shortDate' }}</td>
                  <td>₹{{ o.total }}</td>
                  <td>
                    <select [ngModel]="o.status" (ngModelChange)="updateStatus(o, $event)" class="status-select" [attr.data-status]="o.status">
                      <option value="Pending">Pending</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td><button class="action-btn" (click)="viewOrder = viewOrder?._id === o._id ? null : o">👁️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="order-detail-panel" *ngIf="viewOrder">
            <h3>Order Details - #{{ viewOrder._id.slice(-6).toUpperCase() }}</h3>
            <div class="od-grid">
              <div>
                <h4>Items</h4>
                <div class="od-item" *ngFor="let item of viewOrder.items">
                  {{ item.name }} × {{ item.quantity }} = ₹{{ item.price * item.quantity }}
                </div>
                <div class="od-total">Total: ₹{{ viewOrder.total }}</div>
              </div>
              <div>
                <h4>Delivery Address</h4>
                <p>{{ viewOrder.address.name }}<br>{{ viewOrder.address.street }}<br>{{ viewOrder.address.city }} - {{ viewOrder.address.pincode }}<br>📞 {{ viewOrder.address.phone }}</p>
                <h4>Payment</h4>
                <p>{{ viewOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customers -->
        <div *ngIf="tab==='customers'" class="admin-content">
          <h1>Customers</h1>
          <div class="data-table">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let c of customers">
                  <td><strong>{{ c.name }}</strong></td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.phone || 'N/A' }}</td>
                  <td><span class="badge" [class.green]="c.status==='active'" [class.red]="c.status==='blocked'">{{ c.status }}</span></td>
                  <td>
                    <button class="action-btn" (click)="toggleCustomer(c)">{{ c.status === 'active' ? '🔒' : '🔓' }}</button>
                    <button class="action-btn delete" (click)="deleteCustomer(c._id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reports -->
        <div *ngIf="tab==='reports'" class="admin-content">
          <h1>Reports & Analytics</h1>
          <div class="report-cards" *ngIf="report">
            <div class="report-card">
              <h3>📊 Order Summary</h3>
              <div class="report-stat"><span>Total Orders</span><span>{{ report.totalOrders }}</span></div>
              <div class="report-stat"><span>Delivered</span><span class="green">{{ report.deliveredOrders }}</span></div>
              <div class="report-stat"><span>Cancelled</span><span class="red">{{ report.cancelledOrders }}</span></div>
              <div class="report-stat"><span>Pending</span><span class="yellow">{{ report.pendingOrders }}</span></div>
            </div>
            <div class="report-card">
              <h3>💰 Revenue</h3>
              <div class="revenue-big">₹{{ report.totalRevenue | number }}</div>
              <p class="revenue-sub">Total Revenue (excl. cancelled)</p>
            </div>
            <div class="report-card full">
              <h3>🏆 Top Products by Sales</h3>
              <div class="tp-list">
                <div class="tp-item" *ngFor="let p of report.topProducts; let i = index">
                  <span class="tp-rank">#{{ i+1 }}</span>
                  <span class="tp-name">{{ p._id }}</span>
                  <span class="tp-qty">{{ p.totalSold }} units</span>
                  <span class="tp-rev">₹{{ p.revenue | number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div *ngIf="tab==='settings'" class="admin-content">
          <h1>Settings</h1>
          <div class="settings-form">
            <div class="form-group"><label>Shop Name</label><input value="ShopSmart"></div>
            <div class="form-group"><label>Contact Email</label><input value="support@shopsmart.com"></div>
            <div class="form-group"><label>Contact Phone</label><input value="+91 98765 43210"></div>
            <div class="form-group"><label>Delivery Charges (₹)</label><input type="number" value="40"></div>
            <div class="form-group"><label>Free Delivery Threshold (₹)</label><input type="number" value="500"></div>
            <button class="save-btn">Save Settings</button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-page { display: flex; min-height: 100vh; background: #f1f5f9; }
    .admin-sidebar { width: 250px; background: linear-gradient(180deg, #0f172a, #1e293b); color: white; padding: 1.5rem 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
    .admin-brand { padding: 0 1.5rem 1.5rem; font-size: 1.3rem; font-weight: 800; font-family: 'Outfit', sans-serif; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-brand span { font-size: 1.3rem; }
    .hl { color: #4ade80; }
    .admin-brand small { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 400; margin-top: 0.2rem; }
    nav { padding: 1rem 0.75rem; }
    nav a { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.75rem; border-radius: 10px; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.2s; font-size: 0.9rem; text-decoration: none; margin-bottom: 0.15rem; }
    nav a:hover, nav a.active { background: rgba(74,222,128,0.15); color: white; }
    .logout-link { color: #f87171 !important; margin-top: 1rem; }
    .admin-main { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; }
    .admin-content h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .content-header h1 { margin-bottom: 0; }
    .primary-btn { background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .primary-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.3); }

    /* Stat Cards */
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .bg-green { background: #dcfce7; }
    .bg-blue { background: #dbeafe; }
    .bg-yellow { background: #fef3c7; }
    .bg-purple { background: #f3e8ff; }
    .bg-teal { background: #ccfbf1; }
    .bg-red { background: #fef2f2; }
    .stat-num { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0; }
    .stat-label { font-size: 0.8rem; color: #94a3b8; margin: 0; }

    /* Charts */
    .dashboard-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .chart-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .chart-card h3 { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem; }
    .simple-chart { display: flex; align-items: flex-end; gap: 0.75rem; height: 180px; padding-top: 1rem; }
    .chart-bar { flex: 1; background: linear-gradient(180deg, #4ade80, #22c55e); border-radius: 8px 8px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-height: 20px; position: relative; transition: all 0.3s; }
    .chart-bar:hover { opacity: 0.8; }
    .bar-val { font-size: 0.65rem; color: #1e293b; font-weight: 600; position: absolute; top: -18px; white-space: nowrap; }
    .bar-label { font-size: 0.7rem; color: #64748b; position: absolute; bottom: -18px; }
    .top-list { max-height: 200px; overflow-y: auto; }
    .top-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .top-rank { font-weight: 700; color: #4ade80; min-width: 30px; }
    .top-name { flex: 1; color: #1e293b; }
    .top-sold { color: #64748b; font-size: 0.8rem; }

    /* Data Table */
    .data-table { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.85rem 1rem; background: #f8fafc; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #4b5563; }
    tr:hover { background: #fafafa; }
    tr.low-stock { background: #fef2f2; }
    .danger { color: #ef4444; font-weight: 600; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge.green { background: #dcfce7; color: #16a34a; }
    .badge.red { background: #fef2f2; color: #dc2626; }
    .action-btn { border: none; background: transparent; cursor: pointer; font-size: 1rem; padding: 0.3rem; border-radius: 6px; transition: background 0.2s; }
    .action-btn:hover { background: #f1f5f9; }
    .action-btn.delete:hover { background: #fef2f2; }
    .action-btn.edit:hover { background: #eff6ff; }

    /* Product Image Thumbnails */
    .product-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1.5px solid #e2e8f0; }
    .no-img { font-size: 1.3rem; opacity: 0.4; }

    /* Image Upload */
    .image-upload-zone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 1.25rem; text-align: center; cursor: pointer; transition: all 0.25s; background: #f8fafc; min-height: 120px; display: flex; align-items: center; justify-content: center; }
    .image-upload-zone:hover { border-color: #4ade80; background: #f0fdf4; }
    .upload-placeholder { color: #94a3b8; }
    .upload-placeholder .upload-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .upload-placeholder p { margin: 0; font-size: 0.9rem; font-weight: 500; }
    .upload-placeholder small { font-size: 0.75rem; }
    .image-preview { max-width: 200px; max-height: 150px; border-radius: 10px; object-fit: cover; }
    .remove-img-btn { background: none; border: none; color: #ef4444; font-size: 0.8rem; cursor: pointer; padding: 0.3rem 0; font-weight: 600; }
    .remove-img-btn:hover { text-decoration: underline; }
    .form-actions { margin-top: 0.5rem; }

    /* Forms */
    .product-form-card { background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .product-form-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem; }
    .pf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.5rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.65rem 0.8rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #4ade80; }
    .save-btn { padding: 0.65rem 1.5rem; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .save-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,222,128,0.3); }
    .search-row { margin-bottom: 1rem; display: flex; }
    .search-row input { flex: 1; padding: 0.65rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; }
    .search-row input:focus { border-color: #4ade80; }
    .cat-form { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; align-items: flex-end; }
    .cat-form input { flex: 1; padding: 0.65rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; }
    .cat-icon-picker { display: flex; flex-direction: column; gap: 0.3rem; }
    .cat-icon-picker label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
    .icon-input { width: 60px !important; flex: none !important; text-align: center; font-size: 1.2rem !important; }
    .cat-icon-cell { font-size: 1.4rem; }
    .cancel-btn { background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .cancel-btn:hover { background: #e2e8f0; }
    .filter-select { padding: 0.5rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; outline: none; background: white; }
    .status-select { padding: 0.3rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; outline: none; background: white; }
    .order-detail-panel { background: white; border-radius: 16px; padding: 1.5rem; margin-top: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .order-detail-panel h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem; }
    .od-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .od-grid h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .od-grid p { font-size: 0.85rem; color: #4b5563; line-height: 1.5; margin: 0 0 0.75rem; }
    .od-item { font-size: 0.85rem; padding: 0.3rem 0; color: #4b5563; border-bottom: 1px solid #f1f5f9; }
    .od-total { font-weight: 700; padding-top: 0.5rem; color: #1e293b; }
    .report-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .report-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .report-card.full { grid-column: 1 / -1; }
    .report-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem; }
    .report-stat { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
    .green { color: #16a34a; font-weight: 600; }
    .red { color: #dc2626; font-weight: 600; }
    .yellow { color: #d97706; font-weight: 600; }
    .revenue-big { font-size: 2.5rem; font-weight: 800; color: #1e293b; font-family: 'Outfit', sans-serif; }
    .revenue-sub { font-size: 0.85rem; color: #64748b; }
    .tp-list { }
    .tp-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .tp-rank { font-weight: 700; color: #4ade80; min-width: 30px; }
    .tp-name { flex: 1; color: #1e293b; }
    .tp-qty { color: #64748b; font-size: 0.8rem; min-width: 70px; }
    .tp-rev { font-weight: 600; color: #1e293b; }
    .settings-form { background: white; border-radius: 16px; padding: 1.5rem; max-width: 500px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 0.75rem; }
    @media (max-width: 768px) {
      .admin-page { flex-direction: column; }
      .admin-sidebar { width: 100%; height: auto; position: relative; }
      nav { display: flex; flex-wrap: wrap; gap: 0.25rem; }
      .stat-cards { grid-template-columns: 1fr 1fr; }
      .dashboard-charts { grid-template-columns: 1fr; }
      .pf-grid { grid-template-columns: 1fr; }
      .report-cards { grid-template-columns: 1fr; }
      .od-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminComponent implements OnInit {
  tab = 'dashboard';
  products: Product[] = [];
  categories: Category[] = [];
  allOrders: Order[] = [];
  customers: User[] = [];
  report: Report | null = null;
  viewOrder: Order | null = null;
  showProductForm = false;
  editingProduct: Product | null = null;
  productSearch = '';
  orderFilter = '';
  newCatName = '';
  newCatIcon = '';
  editingCategory: Category | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  baseUrl = environment.apiUrl.replace('/api', '');

  stats = { products: 0, orders: 0, pending: 0, revenue: 0, customers: 0, lowStock: 0 };
  pForm: any = { name: '', category: '', price: 0, discount: 0, stock: 0, weight: '', description: '', nutrition: '' };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadProducts();
    this.loadCategories();
    this.loadOrders();
    this.loadCustomers();
    this.loadReports();
  }

  loadProducts() {
    const filters: any = { limit: 100 };
    if (this.productSearch) filters.search = this.productSearch;
    this.productService.getProducts(filters).subscribe(res => {
      this.products = res.products;
      this.stats.products = res.total;
      this.stats.lowStock = res.products.filter(p => p.stock < 5).length;
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadOrders() {
    this.orderService.getAllOrders({ status: this.orderFilter, limit: 100 }).subscribe(res => {
      this.allOrders = res.orders;
      this.stats.orders = res.total;
      this.stats.pending = res.orders.filter(o => o.status === 'Pending').length;
    });
  }

  loadCustomers() {
    this.authService.getCustomers().subscribe(custs => {
      this.customers = custs;
      this.stats.customers = custs.length;
    });
  }

  loadReports() {
    this.orderService.getReports().subscribe(r => {
      this.report = r;
      this.stats.revenue = r.totalRevenue;
    });
  }

  getCatName(p: Product): string {
    const c = p.category as Category;
    return c?.name || '';
  }

  getCustomerName(o: Order): string {
    const u = o.user as User;
    return u?.name || '';
  }

  getBarHeight(revenue: number): number {
    if (!this.report) return 0;
    const max = Math.max(...this.report.dailyRevenue.map(d => d.revenue), 1);
    return (revenue / max) * 100;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return this.baseUrl + path;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.imagePreview = URL.createObjectURL(this.selectedFile);
    }
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    }
  }

  clearImage(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveProduct() {
    const formData = new FormData();
    Object.keys(this.pForm).forEach(key => {
      if (this.pForm[key] !== '' && this.pForm[key] !== null) {
        formData.append(key, this.pForm[key]);
      }
    });
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct._id, formData).subscribe(() => {
        this.showProductForm = false;
        this.editingProduct = null;
        this.resetPForm();
        this.loadProducts();
      });
    } else {
      this.productService.createProduct(formData).subscribe(() => {
        this.showProductForm = false;
        this.resetPForm();
        this.loadProducts();
        this.loadCategories();
      });
    }
  }

  editProduct(p: Product) {
    this.editingProduct = p;
    const cat = p.category as Category;
    this.pForm = { name: p.name, category: cat?._id || '', price: p.price, discount: p.discount, stock: p.stock, weight: p.weight, description: p.description, nutrition: p.nutrition };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showProductForm = true;
  }

  deleteProduct(id: string) {
    if (confirm('Delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => { this.loadProducts(); this.loadCategories(); });
    }
  }

  resetPForm() {
    this.pForm = { name: '', category: '', price: 0, discount: 0, stock: 0, weight: '', description: '', nutrition: '' };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  addCategory() {
    if (!this.newCatName) return;
    const data: any = { name: this.newCatName };
    if (this.newCatIcon) data.image = this.newCatIcon;
    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory._id, data).subscribe(() => {
        this.cancelCatEdit();
        this.loadCategories();
      });
    } else {
      this.categoryService.createCategory(data).subscribe(() => {
        this.newCatName = '';
        this.newCatIcon = '';
        this.loadCategories();
      });
    }
  }

  editCat(c: Category) {
    this.editingCategory = c;
    this.newCatName = c.name;
    this.newCatIcon = c.image || '';
  }

  cancelCatEdit() {
    this.editingCategory = null;
    this.newCatName = '';
    this.newCatIcon = '';
  }

  deleteCategory(id: string) {
    if (confirm('Delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  updateStatus(order: Order, status: string) {
    this.orderService.updateOrderStatus(order._id, status).subscribe(updated => {
      order.status = updated.status;
      this.loadOrders();
    });
  }

  toggleCustomer(c: User) {
    const newStatus = c.status === 'active' ? 'blocked' : 'active';
    this.authService.updateCustomerStatus(c._id, newStatus).subscribe(() => this.loadCustomers());
  }

  deleteCustomer(id: string) {
    this.authService.deleteCustomer(id).subscribe(() => this.loadCustomers());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
