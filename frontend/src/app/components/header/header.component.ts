import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/interfaces';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">Shop<span class="logo-highlight">Smart</span></span>
        </a>

        <div class="search-wrapper">
          <div class="search-bar">
            <i class="search-icon">🔍</i>
            <input type="text" placeholder="Search for groceries, fruits, snacks..."
                   [(ngModel)]="searchQuery"
                   (input)="onSearch()"
                   (keyup.enter)="goToSearch()"
                   (focus)="showSuggestions = true"
                   (blur)="hideSuggestions()">
            <button class="search-btn" (click)="goToSearch()">Search</button>
          </div>
          <div class="suggestions" *ngIf="showSuggestions && suggestions.length > 0">
            <a *ngFor="let item of suggestions" (mousedown)="selectProduct(item)" class="suggestion-item">
              <span class="suggestion-name">{{ item.name }}</span>
              <span class="suggestion-price">₹{{ item.price }}</span>
            </a>
          </div>
        </div>

        <div class="header-actions">
          <div class="location-selector">
            <span class="location-icon">📍</span>
            <span class="location-text">Deliver to<br><strong>{{ selectedCity }}</strong></span>
          </div>

          <div class="auth-section" *ngIf="!authService.isLoggedIn">
            <a routerLink="/login" class="login-btn">
              <span class="login-icon">👤</span>
              Login / Register
            </a>
          </div>

          <div class="user-menu" *ngIf="authService.isLoggedIn" (click)="showDropdown = !showDropdown" (blur)="showDropdown = false" tabindex="0">
            <span class="user-icon">👤</span>
            <span class="user-name">{{ authService.currentUser?.name }}</span>
            <span class="dropdown-arrow">▾</span>
            <div class="dropdown" *ngIf="showDropdown">
              <a routerLink="/dashboard" class="dropdown-item">My Profile</a>
              <a routerLink="/dashboard/orders" class="dropdown-item">My Orders</a>
              <a routerLink="/admin" *ngIf="authService.isAdmin" class="dropdown-item admin-link">Admin Panel</a>
              <div class="dropdown-divider"></div>
              <a (click)="logout()" class="dropdown-item logout">Logout</a>
            </div>
          </div>

          <a routerLink="/cart" class="cart-btn">
            <span class="cart-icon">🛒</span>
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </a>
        </div>

        <button class="mobile-menu-btn" (click)="mobileMenu = !mobileMenu">☰</button>
      </div>

      <div class="mobile-nav" *ngIf="mobileMenu">
        <a routerLink="/" (click)="mobileMenu=false">Home</a>
        <a routerLink="/shop" (click)="mobileMenu=false">Shop</a>
        <a routerLink="/cart" (click)="mobileMenu=false">Cart ({{ cartCount }})</a>
        <a routerLink="/login" *ngIf="!authService.isLoggedIn" (click)="mobileMenu=false">Login</a>
        <a routerLink="/dashboard" *ngIf="authService.isLoggedIn" (click)="mobileMenu=false">My Account</a>
        <a routerLink="/admin" *ngIf="authService.isAdmin" (click)="mobileMenu=false">Admin</a>
        <a *ngIf="authService.isLoggedIn" (click)="logout(); mobileMenu=false">Logout</a>
      </div>
    </header>
  `,
    styles: [`
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .header-container { max-width: 1400px; margin: 0 auto; padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
    .logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: white; }
    .logo-icon { font-size: 1.8rem; }
    .logo-text { font-size: 1.5rem; font-weight: 800; font-family: 'Outfit', sans-serif; }
    .logo-highlight { color: #4ade80; }
    .search-wrapper { flex: 1; position: relative; max-width: 550px; }
    .search-bar { display: flex; align-items: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; overflow: hidden; transition: all 0.3s; }
    .search-bar:focus-within { background: rgba(255,255,255,0.15); border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }
    .search-icon { padding: 0 0.75rem; font-size: 1rem; }
    .search-bar input { flex: 1; border: none; background: transparent; color: white; padding: 0.75rem 0; font-size: 0.95rem; outline: none; }
    .search-bar input::placeholder { color: rgba(255,255,255,0.5); }
    .search-btn { background: #4ade80; color: #1a1a2e; border: none; padding: 0.75rem 1.25rem; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background 0.3s; }
    .search-btn:hover { background: #22c55e; }
    .suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #1e293b; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.3); overflow: hidden; z-index: 100; }
    .suggestion-item { display: flex; justify-content: space-between; padding: 0.75rem 1rem; color: white; cursor: pointer; transition: background 0.2s; text-decoration: none; }
    .suggestion-item:hover { background: rgba(74,222,128,0.1); }
    .suggestion-price { color: #4ade80; font-weight: 600; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .location-selector { display: flex; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.8); font-size: 0.8rem; cursor: pointer; }
    .location-icon { font-size: 1.1rem; }
    .location-text strong { color: white; }
    .login-btn, .cart-btn { display: flex; align-items: center; gap: 0.4rem; color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 10px; transition: all 0.3s; font-weight: 500; font-size: 0.9rem; }
    .login-btn:hover { background: rgba(74,222,128,0.15); }
    .login-icon, .user-icon { font-size: 1.1rem; }
    .cart-btn { position: relative; background: rgba(255,255,255,0.1); }
    .cart-btn:hover { background: rgba(74,222,128,0.2); }
    .cart-icon { font-size: 1.3rem; }
    .cart-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    .user-menu { position: relative; display: flex; align-items: center; gap: 0.4rem; color: white; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 10px; transition: background 0.3s; outline: none; }
    .user-menu:hover { background: rgba(255,255,255,0.1); }
    .user-name { font-size: 0.9rem; font-weight: 500; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dropdown-arrow { font-size: 0.7rem; color: rgba(255,255,255,0.6); }
    .dropdown { position: absolute; top: 100%; right: 0; background: #1e293b; min-width: 180px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); z-index: 100; margin-top: 0.5rem; }
    .dropdown-item { display: block; padding: 0.75rem 1rem; color: rgba(255,255,255,0.8); text-decoration: none; transition: all 0.2s; cursor: pointer; font-size: 0.9rem; }
    .dropdown-item:hover { background: rgba(74,222,128,0.1); color: white; }
    .dropdown-divider { height: 1px; background: rgba(255,255,255,0.1); }
    .admin-link { color: #4ade80; }
    .logout { color: #f87171; }
    .mobile-menu-btn { display: none; background: transparent; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
    .mobile-nav { display: none; }
    @media (max-width: 768px) {
      .header-container { flex-wrap: wrap; gap: 0.75rem; }
      .search-wrapper { order: 3; max-width: 100%; width: 100%; }
      .location-selector, .user-menu, .login-btn { display: none; }
      .mobile-menu-btn { display: block; }
      .mobile-nav { display: flex; flex-direction: column; background: #16213e; padding: 0.5rem; }
      .mobile-nav a { padding: 0.75rem 1rem; color: white; text-decoration: none; border-radius: 8px; font-size: 0.95rem; }
      .mobile-nav a:hover { background: rgba(74,222,128,0.15); }
    }
  `]
})
export class HeaderComponent implements OnInit {
    searchQuery = '';
    suggestions: Product[] = [];
    showSuggestions = false;
    showDropdown = false;
    mobileMenu = false;
    selectedCity = 'Mumbai';
    cartCount = 0;

    constructor(
        public authService: AuthService,
        private cartService: CartService,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit() {
        this.cartService.cart$.subscribe(cart => {
            this.cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        });
        if (this.authService.isLoggedIn) {
            this.cartService.loadCart();
        }
    }

    onSearch() {
        if (this.searchQuery.length >= 2) {
            this.productService.getProducts({ search: this.searchQuery, limit: 5 }).subscribe(res => {
                this.suggestions = res.products;
            });
        } else {
            this.suggestions = [];
        }
    }

    goToSearch() {
        if (this.searchQuery.trim()) {
            this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery } });
            this.showSuggestions = false;
        }
    }

    selectProduct(product: Product) {
        this.router.navigate(['/product', product._id]);
        this.showSuggestions = false;
        this.searchQuery = '';
    }

    hideSuggestions() {
        setTimeout(() => this.showSuggestions = false, 200);
    }

    logout() {
        this.authService.logout();
        this.showDropdown = false;
        this.router.navigate(['/']);
    }
}
