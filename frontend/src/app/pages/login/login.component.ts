import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🛒</span>
          <h2>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
          <p>{{ isLogin ? 'Sign in to continue shopping' : 'Join ShopSmart today' }}</p>
        </div>

        <div class="auth-tabs">
          <button [class.active]="isLogin" (click)="isLogin = true">Login</button>
          <button [class.active]="!isLogin" (click)="isLogin = false">Register</button>
        </div>

        <!-- Login Form -->
        <form *ngIf="isLogin" (ngSubmit)="login()" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="loginData.email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="loginData.password" name="password" placeholder="Enter your password" required>
          </div>
          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <button type="submit" class="submit-btn" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="!isLogin" (ngSubmit)="register()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="registerData.name" name="name" placeholder="Enter your name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="registerData.email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="registerData.phone" name="phone" placeholder="Enter phone number">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="registerData.password" name="password" placeholder="Min 6 characters" required>
          </div>
          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <button type="submit" class="submit-btn" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="demo-info">
            <strong>Demo Credentials:</strong><br>
            User: ravi&#64;example.com / password123<br>
            Admin: admin&#64;shopsmart.com / admin123
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%); }
    .auth-card { background: white; border-radius: 24px; padding: 2.5rem; width: 100%; max-width: 440px; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .auth-logo { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .auth-header h2 { font-size: 1.6rem; font-weight: 700; color: #1e293b; font-family: 'Outfit', sans-serif; }
    .auth-header p { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem; }
    .auth-tabs { display: flex; gap: 0; margin-bottom: 1.5rem; background: #f1f5f9; border-radius: 12px; padding: 4px; }
    .auth-tabs button { flex: 1; padding: 0.65rem; border: none; border-radius: 10px; background: transparent; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.3s; font-size: 0.95rem; }
    .auth-tabs button.active { background: white; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    .form-group input { padding: 0.75rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; transition: all 0.3s; outline: none; }
    .form-group input:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }
    .error-msg { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 10px; font-size: 0.85rem; text-align: center; }
    .submit-btn { background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 0.85rem; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-top: 0.5rem; }
    .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .auth-footer { margin-top: 1.5rem; text-align: center; }
    .demo-info { background: #f8fafc; padding: 1rem; border-radius: 10px; font-size: 0.8rem; color: #64748b; line-height: 1.6; }
  `]
})
export class LoginComponent {
    isLogin = true;
    loading = false;
    error = '';
    loginData = { email: '', password: '' };
    registerData = { name: '', email: '', password: '', phone: '' };

    constructor(private authService: AuthService, private router: Router) {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['/']);
        }
    }

    login() {
        this.loading = true;
        this.error = '';
        this.authService.login(this.loginData).subscribe({
            next: (user) => {
                this.loading = false;
                if (user.role === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/']);
                }
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Login failed';
            }
        });
    }

    register() {
        this.loading = true;
        this.error = '';
        this.authService.register(this.registerData).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Registration failed';
            }
        });
    }
}
