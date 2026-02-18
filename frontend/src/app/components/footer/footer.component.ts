import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterModule],
    template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="footer-logo">
              <span class="logo-icon">🛒</span>
              <span>Shop<span class="highlight">Smart</span></span>
            </div>
            <p class="footer-desc">Your one-stop destination for fresh groceries, delivered to your doorstep with love and care.</p>
            <div class="social-links">
              <a href="#" class="social-btn">📘</a>
              <a href="#" class="social-btn">🐦</a>
              <a href="#" class="social-btn">📸</a>
              <a href="#" class="social-btn">📺</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <a routerLink="/">Home</a>
            <a routerLink="/shop">Shop</a>
            <a routerLink="/cart">Cart</a>
            <a routerLink="/dashboard/orders">My Orders</a>
          </div>
          <div class="footer-col">
            <h4>Policies</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
            <a href="#">Shipping Policy</a>
          </div>
          <div class="footer-col">
            <h4>Contact Us</h4>
            <p>📧 support&#64;shopsmart.com</p>
            <p>📞 +91 98765 43210</p>
            <p>📍 123 Market Street, Mumbai</p>
            <p>🕑 Mon-Sat: 8AM - 10PM</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 ShopSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    .footer { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: rgba(255,255,255,0.7); padding: 3rem 0 0; margin-top: 3rem; }
    .footer-container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 2rem; }
    .footer-logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 800; color: white; font-family: 'Outfit', sans-serif; margin-bottom: 1rem; }
    .logo-icon { font-size: 1.5rem; }
    .highlight { color: #4ade80; }
    .footer-desc { font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
    .social-links { display: flex; gap: 0.5rem; }
    .social-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; font-size: 1rem; transition: all 0.3s; }
    .social-btn:hover { background: rgba(74,222,128,0.2); transform: translateY(-2px); }
    .footer-col h4 { color: white; font-size: 1.05rem; margin-bottom: 1rem; font-family: 'Outfit', sans-serif; }
    .footer-col a, .footer-col p { display: block; color: rgba(255,255,255,0.6); text-decoration: none; padding: 0.3rem 0; font-size: 0.9rem; transition: color 0.2s; }
    .footer-col a:hover { color: #4ade80; }
    .footer-bottom { text-align: center; padding: 1.5rem 0; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; }
    @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
  `]
})
export class FooterComponent { }
