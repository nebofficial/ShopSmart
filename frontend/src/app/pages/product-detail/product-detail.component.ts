import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models/interfaces';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="detail-page" *ngIf="product">
      <div class="breadcrumb">
        <a routerLink="/">Home</a> / <a routerLink="/shop">Shop</a> / <span>{{ product.name }}</span>
      </div>
      <div class="detail-grid">
        <div class="image-section">
          <div class="main-image">{{ getCategoryEmoji() }}</div>
          <div class="image-badge" *ngIf="product.discount > 0">-{{ product.discount }}% OFF</div>
        </div>
        <div class="info-section">
          <span class="product-category">{{ getCategoryName() }}</span>
          <h1>{{ product.name }}</h1>
          <span class="product-weight">{{ product.weight }}</span>
          <div class="price-section">
            <span class="current-price" *ngIf="product.discount > 0">₹{{ getDiscountedPrice() }}</span>
            <span class="original-price" *ngIf="product.discount > 0">₹{{ product.price }}</span>
            <span class="current-price" *ngIf="!product.discount || product.discount === 0">₹{{ product.price }}</span>
            <span class="save-tag" *ngIf="product.discount > 0">Save ₹{{ product.price - getDiscountedPrice() }}</span>
          </div>
          <div class="stock-info" [class.out]="product.stock === 0">
            <span class="stock-dot"></span>
            {{ product.stock > 0 ? 'In Stock (' + product.stock + ' available)' : 'Out of Stock' }}
          </div>
          <div class="quantity-section">
            <span class="qty-label">Quantity:</span>
            <div class="qty-control">
              <button (click)="quantity > 1 && quantity = quantity - 1">−</button>
              <span>{{ quantity }}</span>
              <button (click)="quantity < product.stock && quantity = quantity + 1">+</button>
            </div>
          </div>
          <div class="action-buttons">
            <button class="add-cart-btn" (click)="addToCart()" [disabled]="product.stock === 0"
                    [class.added]="added">
              {{ added ? 'Added to Cart ✓' : 'Add to Cart' }}
            </button>
            <button class="buy-now-btn" (click)="buyNow()" [disabled]="product.stock === 0">
              Buy Now
            </button>
          </div>
          <div class="description-section">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>
          <div class="nutrition-section" *ngIf="product.nutrition">
            <h3>Nutrition Info</h3>
            <p>{{ product.nutrition }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .detail-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .breadcrumb { margin-bottom: 1.5rem; font-size: 0.85rem; color: #64748b; }
    .breadcrumb a { color: #64748b; text-decoration: none; }
    .breadcrumb a:hover { color: #4ade80; }
    .breadcrumb span { color: #1e293b; font-weight: 500; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    .image-section { position: relative; }
    .main-image { height: 400px; display: flex; align-items: center; justify-content: center; font-size: 10rem; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 20px; }
    .image-badge { position: absolute; top: 1rem; left: 1rem; background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 10px; font-weight: 700; }
    .info-section { }
    .product-category { display: inline-block; color: #4ade80; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; font-family: 'Outfit', sans-serif; }
    .product-weight { display: block; color: #94a3b8; font-size: 0.95rem; margin-bottom: 1rem; }
    .price-section { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .current-price { font-size: 2rem; font-weight: 800; color: #1e293b; }
    .original-price { font-size: 1.2rem; color: #94a3b8; text-decoration: line-through; }
    .save-tag { background: #dcfce7; color: #16a34a; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
    .stock-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 1.25rem; }
    .stock-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
    .stock-info.out { color: #ef4444; }
    .stock-info.out .stock-dot { background: #ef4444; }
    .quantity-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .qty-label { font-weight: 600; color: #374151; }
    .qty-control { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .qty-control button { width: 40px; height: 40px; border: none; background: #f8fafc; cursor: pointer; font-size: 1.2rem; font-weight: 600; color: #374151; transition: background 0.2s; }
    .qty-control button:hover { background: #e2e8f0; }
    .qty-control span { width: 50px; text-align: center; font-weight: 600; font-size: 1.05rem; }
    .action-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .add-cart-btn { flex: 1; padding: 0.9rem; border: 2px solid #4ade80; background: transparent; color: #4ade80; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; }
    .add-cart-btn:hover, .add-cart-btn.added { background: #4ade80; color: white; }
    .buy-now-btn { flex: 1; padding: 0.9rem; border: none; background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; }
    .buy-now-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(74,222,128,0.4); }
    .add-cart-btn:disabled, .buy-now-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .description-section, .nutrition-section { margin-bottom: 1.5rem; }
    .description-section h3, .nutrition-section h3 { font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
    .description-section p, .nutrition-section p { color: #4b5563; line-height: 1.7; font-size: 0.95rem; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; gap: 1.5rem; } .main-image { height: 280px; font-size: 6rem; } }
  `]
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    quantity = 1;
    added = false;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.productService.getProduct(params['id']).subscribe(p => this.product = p);
        });
    }

    getCategoryEmoji(): string {
        const cat = this.product?.category as Category;
        return cat?.image || '📦';
    }

    getCategoryName(): string {
        const cat = this.product?.category as Category;
        return cat?.name || '';
    }

    getDiscountedPrice(): number {
        if (!this.product) return 0;
        if (this.product.discount > 0) return Math.round(this.product.price - (this.product.price * this.product.discount / 100));
        return this.product.price;
    }

    addToCart() {
        if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
        this.cartService.addToCart(this.product!._id, this.quantity).subscribe(() => {
            this.added = true;
            setTimeout(() => this.added = false, 2000);
        });
    }

    buyNow() {
        if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
        this.cartService.addToCart(this.product!._id, this.quantity).subscribe(() => {
            this.router.navigate(['/checkout']);
        });
    }
}
