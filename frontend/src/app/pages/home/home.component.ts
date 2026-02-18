import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models/interfaces';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="home">
      <!-- Banner Slider -->
      <section class="banner-section">
        <div class="banner-slider">
          <div class="banner" [class.active]="currentBanner === i" *ngFor="let banner of banners; let i = index">
            <div class="banner-content">
              <span class="banner-tag">{{ banner.tag }}</span>
              <h1>{{ banner.title }}</h1>
              <p>{{ banner.description }}</p>
              <a routerLink="/shop" class="banner-btn">Shop Now →</a>
            </div>
            <div class="banner-emoji">{{ banner.emoji }}</div>
          </div>
          <div class="banner-dots">
            <button *ngFor="let b of banners; let i = index"
                    [class.active]="currentBanner === i"
                    (click)="currentBanner = i" class="dot"></button>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section">
        <div class="section-header">
          <h2>🛍️ Shop by Category</h2>
          <a routerLink="/shop" class="see-all">See All →</a>
        </div>
        <div class="category-grid">
          <a *ngFor="let cat of categories"
             [routerLink]="['/shop']" [queryParams]="{category: cat._id}"
             class="category-card">
            <span class="cat-emoji">{{ cat.image }}</span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ cat.productCount }} items</span>
          </a>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section" *ngIf="featuredProducts.length > 0">
        <div class="section-header">
          <h2>⭐ Featured Products</h2>
          <a routerLink="/shop" [queryParams]="{featured: true}" class="see-all">See All →</a>
        </div>
        <div class="product-scroll">
          <div class="product-card" *ngFor="let product of featuredProducts">
            <div class="product-badge" *ngIf="product.discount > 0">-{{ product.discount }}%</div>
            <a [routerLink]="['/product', product._id]" class="product-image-link">
              <div class="product-image">{{ getCategoryEmoji(product) }}</div>
            </a>
            <div class="product-info">
              <span class="product-category">{{ getCategoryName(product) }}</span>
              <a [routerLink]="['/product', product._id]" class="product-name">{{ product.name }}</a>
              <span class="product-weight">{{ product.weight }}</span>
              <div class="product-price-row">
                <span class="price" *ngIf="product.discount > 0">
                  <span class="old-price">₹{{ product.price }}</span>
                  ₹{{ getDiscountedPrice(product) }}
                </span>
                <span class="price" *ngIf="product.discount === 0">₹{{ product.price }}</span>
              </div>
              <button class="add-to-cart-btn" (click)="addToCart(product)"
                      [class.added]="addedProducts.has(product._id)"
                      [disabled]="product.stock === 0">
                {{ product.stock === 0 ? 'Out of Stock' : addedProducts.has(product._id) ? 'Added ✓' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Best Sellers -->
      <section class="section" *ngIf="bestSellers.length > 0">
        <div class="section-header">
          <h2>🔥 Best Sellers</h2>
          <a routerLink="/shop" [queryParams]="{bestSeller: true}" class="see-all">See All →</a>
        </div>
        <div class="product-grid">
          <div class="product-card" *ngFor="let product of bestSellers">
            <div class="product-badge best">Best Seller</div>
            <a [routerLink]="['/product', product._id]" class="product-image-link">
              <div class="product-image">{{ getCategoryEmoji(product) }}</div>
            </a>
            <div class="product-info">
              <span class="product-category">{{ getCategoryName(product) }}</span>
              <a [routerLink]="['/product', product._id]" class="product-name">{{ product.name }}</a>
              <span class="product-weight">{{ product.weight }}</span>
              <div class="product-price-row">
                <span class="price">₹{{ getDiscountedPrice(product) }}</span>
              </div>
              <button class="add-to-cart-btn" (click)="addToCart(product)"
                      [class.added]="addedProducts.has(product._id)"
                      [disabled]="product.stock === 0">
                {{ product.stock === 0 ? 'Out of Stock' : addedProducts.has(product._id) ? 'Added ✓' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Promo Banner -->
      <section class="promo-section">
        <div class="promo-card">
          <div class="promo-content">
            <h2>🚚 Free Delivery on Orders Over ₹500!</h2>
            <p>Fresh groceries delivered to your doorstep. Order now and save on delivery.</p>
            <a routerLink="/shop" class="promo-btn">Start Shopping</a>
          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .home { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }

    /* Banner */
    .banner-section { margin: 2rem 0; }
    .banner-slider { position: relative; border-radius: 20px; overflow: hidden; min-height: 320px; }
    .banner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 3rem; opacity: 0; transition: opacity 0.6s ease; }
    .banner.active { position: relative; opacity: 1; }
    .banner:nth-child(1) { background: linear-gradient(135deg, #0f766e, #14b8a6); }
    .banner:nth-child(2) { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
    .banner:nth-child(3) { background: linear-gradient(135deg, #ea580c, #fb923c); }
    .banner-content { color: white; max-width: 60%; }
    .banner-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
    .banner-content h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.2; font-family: 'Outfit', sans-serif; }
    .banner-content p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.9; }
    .banner-btn { display: inline-block; background: white; color: #0f766e; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; transition: transform 0.3s; }
    .banner-btn:hover { transform: translateY(-2px); }
    .banner-emoji { font-size: 8rem; opacity: 0.3; }
    .banner-dots { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); border: none; cursor: pointer; transition: all 0.3s; }
    .dot.active { background: white; width: 28px; border-radius: 5px; }

    /* Section */
    .section { margin: 3rem 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; font-family: 'Outfit', sans-serif; }
    .see-all { color: #4ade80; font-weight: 600; text-decoration: none; font-size: 0.95rem; }
    .see-all:hover { text-decoration: underline; }

    /* Categories */
    .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
    .category-card { background: white; border-radius: 16px; padding: 1.5rem 1rem; text-align: center; text-decoration: none; color: #1e293b; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #f1f5f9; }
    .category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); border-color: #4ade80; }
    .cat-emoji { display: block; font-size: 2.5rem; margin-bottom: 0.5rem; }
    .cat-name { display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
    .cat-count { display: block; font-size: 0.8rem; color: #94a3b8; }

    /* Products */
    .product-scroll { display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 1rem; scroll-snap-type: x mandatory; }
    .product-scroll::-webkit-scrollbar { height: 6px; }
    .product-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
    .product-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #f1f5f9; min-width: 220px; scroll-snap-align: start; position: relative; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .product-badge { position: absolute; top: 0.75rem; left: 0.75rem; background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; z-index: 2; }
    .product-badge.best { background: #f59e0b; }
    .product-image-link { text-decoration: none; }
    .product-image { height: 140px; display: flex; align-items: center; justify-content: center; font-size: 4rem; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); }
    .product-info { padding: 1rem; }
    .product-category { display: block; font-size: 0.75rem; color: #4ade80; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .product-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.95rem; text-decoration: none; margin-bottom: 0.25rem; }
    .product-name:hover { color: #4ade80; }
    .product-weight { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem; }
    .product-price-row { margin-bottom: 0.75rem; }
    .price { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .old-price { text-decoration: line-through; color: #94a3b8; font-size: 0.85rem; font-weight: 400; margin-right: 0.5rem; }
    .add-to-cart-btn { width: 100%; padding: 0.6rem; border-radius: 10px; border: 2px solid #4ade80; background: transparent; color: #4ade80; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 0.9rem; }
    .add-to-cart-btn:hover { background: #4ade80; color: white; }
    .add-to-cart-btn.added { background: #4ade80; color: white; }
    .add-to-cart-btn:disabled { border-color: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

    /* Promo */
    .promo-section { margin: 3rem 0; }
    .promo-card { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 20px; padding: 3rem; text-align: center; color: white; }
    .promo-card h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.75rem; font-family: 'Outfit', sans-serif; }
    .promo-card p { font-size: 1.05rem; opacity: 0.8; margin-bottom: 1.5rem; }
    .promo-btn { display: inline-block; background: #4ade80; color: #1e293b; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; transition: transform 0.3s; }
    .promo-btn:hover { transform: translateY(-2px); }

    @media (max-width: 768px) {
      .banner-content { max-width: 100%; }
      .banner-content h1 { font-size: 1.5rem; }
      .banner-emoji { display: none; }
      .banner { padding: 2rem; }
      .category-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
    }
  `]
})
export class HomeComponent implements OnInit {
    categories: Category[] = [];
    featuredProducts: Product[] = [];
    bestSellers: Product[] = [];
    addedProducts = new Set<string>();
    currentBanner = 0;

    banners = [
        { tag: 'Fresh Deals', title: 'Fresh Groceries Delivered in 30 Minutes', description: 'Get farm-fresh fruits, vegetables, and daily essentials at unbeatable prices.', emoji: '🥬' },
        { tag: 'Weekend Special', title: 'Up to 40% Off on Premium Products', description: 'Exclusive discounts on dairy, organic products, and imported items.', emoji: '🎉' },
        { tag: 'New Arrivals', title: 'Discover Exotic Fruits & Snacks', description: 'Try our latest collection of international flavors and healthy snacks.', emoji: '🍓' }
    ];

    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
        private cartService: CartService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.categoryService.getCategories().subscribe(cats => this.categories = cats);
        this.productService.getProducts({ featured: 'true', limit: 8 }).subscribe(res => this.featuredProducts = res.products);
        this.productService.getProducts({ bestSeller: 'true', limit: 8 }).subscribe(res => this.bestSellers = res.products);

        // Auto-rotate banners
        setInterval(() => {
            this.currentBanner = (this.currentBanner + 1) % this.banners.length;
        }, 5000);
    }

    getCategoryEmoji(product: Product): string {
        const cat = product.category as Category;
        return cat?.image || '📦';
    }

    getCategoryName(product: Product): string {
        const cat = product.category as Category;
        return cat?.name || '';
    }

    getDiscountedPrice(product: Product): number {
        if (product.discount > 0) {
            return Math.round(product.price - (product.price * product.discount / 100));
        }
        return product.price;
    }

    addToCart(product: Product) {
        if (!this.authService.isLoggedIn) {
            window.location.href = '/login';
            return;
        }
        this.cartService.addToCart(product._id).subscribe(() => {
            this.addedProducts.add(product._id);
            setTimeout(() => this.addedProducts.delete(product._id), 2000);
        });
    }
}
