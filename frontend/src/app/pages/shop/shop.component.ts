import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models/interfaces';

@Component({
    selector: 'app-shop',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="shop-page">
      <div class="shop-header">
        <h1>🛍️ All Products</h1>
        <p>{{ totalProducts }} products available</p>
      </div>
      <div class="shop-layout">
        <!-- Filters -->
        <aside class="filter-panel" [class.open]="showFilters">
          <div class="filter-header">
            <h3>Filters</h3>
            <button class="clear-btn" (click)="clearFilters()">Clear All</button>
          </div>

          <div class="filter-section">
            <h4>Category</h4>
            <label *ngFor="let cat of categories" class="filter-checkbox">
              <input type="checkbox" [checked]="selectedCategory === cat._id"
                     (change)="toggleCategory(cat._id)">
              <span>{{ cat.name }} ({{ cat.productCount }})</span>
            </label>
          </div>

          <div class="filter-section">
            <h4>Price Range</h4>
            <div class="price-inputs">
              <input type="number" [(ngModel)]="minPrice" placeholder="₹ Min" (change)="applyFilters()">
              <span>—</span>
              <input type="number" [(ngModel)]="maxPrice" placeholder="₹ Max" (change)="applyFilters()">
            </div>
          </div>

          <div class="filter-section">
            <h4>Availability</h4>
            <label class="filter-checkbox">
              <input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()">
              <span>In Stock Only</span>
            </label>
          </div>

          <div class="filter-section">
            <h4>Sort By</h4>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-select">
              <option value="">Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Popular</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </aside>

        <button class="mobile-filter-toggle" (click)="showFilters = !showFilters">
          🔽 {{ showFilters ? 'Hide' : 'Show' }} Filters
        </button>

        <!-- Products Grid -->
        <div class="products-area">
          <div class="products-grid">
            <div class="product-card" *ngFor="let product of products">
              <div class="product-badge" *ngIf="product.discount > 0">-{{ product.discount }}%</div>
              <a [routerLink]="['/product', product._id]" class="product-image-link">
                <div class="product-image">{{ getCategoryEmoji(product) }}</div>
              </a>
              <div class="product-info">
                <span class="product-category">{{ getCategoryName(product) }}</span>
                <a [routerLink]="['/product', product._id]" class="product-name">{{ product.name }}</a>
                <span class="product-weight">{{ product.weight }}</span>
                <span class="stock-status" [class.out]="product.stock === 0">
                  {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                </span>
                <div class="product-price-row">
                  <span class="price" *ngIf="product.discount > 0">
                    <span class="old-price">₹{{ product.price }}</span>
                    ₹{{ getDiscountedPrice(product) }}
                  </span>
                  <span class="price" *ngIf="!product.discount || product.discount === 0">₹{{ product.price }}</span>
                </div>
                <div class="card-actions">
                  <a [routerLink]="['/product', product._id]" class="view-btn">View Details</a>
                  <button class="add-btn" (click)="addToCart(product)"
                          [class.added]="addedProducts.has(product._id)"
                          [disabled]="product.stock === 0">
                    {{ addedProducts.has(product._id) ? '✓' : '+' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="no-products" *ngIf="products.length === 0 && !loading">
            <span class="no-emoji">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="page-btn">← Prev</button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="page-btn">Next →</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .shop-page { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
    .shop-header { margin-bottom: 1.5rem; }
    .shop-header h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; font-family: 'Outfit', sans-serif; }
    .shop-header p { color: #64748b; font-size: 0.9rem; }
    .shop-layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; }
    .filter-panel { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 80px; border: 1px solid #f1f5f9; }
    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .filter-header h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .clear-btn { background: transparent; border: none; color: #ef4444; font-size: 0.85rem; cursor: pointer; font-weight: 500; }
    .filter-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; }
    .filter-section h4 { font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
    .filter-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.9rem; color: #4b5563; }
    .filter-checkbox input { accent-color: #4ade80; width: 16px; height: 16px; }
    .price-inputs { display: flex; gap: 0.5rem; align-items: center; }
    .price-inputs input { width: 100%; padding: 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; outline: none; }
    .price-inputs input:focus { border-color: #4ade80; }
    .sort-select { width: 100%; padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; background: white; cursor: pointer; }
    .sort-select:focus { border-color: #4ade80; }
    .mobile-filter-toggle { display: none; width: 100%; padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 10px; background: white; font-size: 0.9rem; cursor: pointer; margin-bottom: 1rem; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.25rem; }
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #f1f5f9; position: relative; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .product-badge { position: absolute; top: 0.75rem; left: 0.75rem; background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; z-index: 2; }
    .product-image-link { text-decoration: none; }
    .product-image { height: 150px; display: flex; align-items: center; justify-content: center; font-size: 4rem; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); }
    .product-info { padding: 1rem; }
    .product-category { display: block; font-size: 0.75rem; color: #4ade80; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .product-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.95rem; text-decoration: none; margin-bottom: 0.25rem; }
    .product-name:hover { color: #4ade80; }
    .product-weight { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem; }
    .stock-status { display: inline-block; font-size: 0.75rem; font-weight: 600; color: #22c55e; margin-bottom: 0.5rem; }
    .stock-status.out { color: #ef4444; }
    .product-price-row { margin-bottom: 0.75rem; }
    .price { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .old-price { text-decoration: line-through; color: #94a3b8; font-size: 0.85rem; font-weight: 400; margin-right: 0.5rem; }
    .card-actions { display: flex; gap: 0.5rem; }
    .view-btn { flex: 1; text-align: center; padding: 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px; color: #64748b; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.3s; }
    .view-btn:hover { border-color: #4ade80; color: #4ade80; }
    .add-btn { width: 40px; height: 40px; border-radius: 8px; border: 1.5px solid #4ade80; background: transparent; color: #4ade80; font-size: 1.2rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
    .add-btn:hover, .add-btn.added { background: #4ade80; color: white; }
    .add-btn:disabled { border-color: #e2e8f0; color: #e2e8f0; cursor: not-allowed; background: transparent; }
    .no-products { text-align: center; padding: 4rem 2rem; }
    .no-emoji { font-size: 4rem; }
    .no-products h3 { font-size: 1.3rem; color: #1e293b; margin-top: 1rem; }
    .no-products p { color: #64748b; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
    .page-btn { padding: 0.6rem 1.25rem; border: 1.5px solid #e2e8f0; border-radius: 10px; background: white; cursor: pointer; font-weight: 500; transition: all 0.3s; }
    .page-btn:hover:not(:disabled) { border-color: #4ade80; color: #4ade80; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 0.9rem; color: #64748b; }
    @media (max-width: 768px) {
      .shop-layout { grid-template-columns: 1fr; }
      .filter-panel { display: none; position: static; }
      .filter-panel.open { display: block; }
      .mobile-filter-toggle { display: block; }
      .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    }
  `]
})
export class ShopComponent implements OnInit {
    products: Product[] = [];
    categories: Category[] = [];
    selectedCategory = '';
    minPrice: number | null = null;
    maxPrice: number | null = null;
    inStockOnly = false;
    sortBy = '';
    searchQuery = '';
    currentPage = 1;
    totalPages = 1;
    totalProducts = 0;
    loading = false;
    showFilters = false;
    addedProducts = new Set<string>();

    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
        private cartService: CartService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.categoryService.getCategories().subscribe(cats => this.categories = cats);
        this.route.queryParams.subscribe(params => {
            if (params['category']) this.selectedCategory = params['category'];
            if (params['search']) this.searchQuery = params['search'];
            this.applyFilters();
        });
    }

    applyFilters() {
        this.loading = true;
        const filters: any = { page: this.currentPage, limit: 12 };
        if (this.selectedCategory) filters.category = this.selectedCategory;
        if (this.minPrice) filters.minPrice = this.minPrice;
        if (this.maxPrice) filters.maxPrice = this.maxPrice;
        if (this.inStockOnly) filters.inStock = 'true';
        if (this.sortBy) filters.sort = this.sortBy;
        if (this.searchQuery) filters.search = this.searchQuery;

        this.productService.getProducts(filters).subscribe({
            next: res => {
                this.products = res.products;
                this.totalPages = res.pages;
                this.totalProducts = res.total;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    toggleCategory(categoryId: string) {
        this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
        this.currentPage = 1;
        this.applyFilters();
    }

    clearFilters() {
        this.selectedCategory = '';
        this.minPrice = null;
        this.maxPrice = null;
        this.inStockOnly = false;
        this.sortBy = '';
        this.searchQuery = '';
        this.currentPage = 1;
        this.applyFilters();
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.applyFilters();
        }
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
        if (product.discount > 0) return Math.round(product.price - (product.price * product.discount / 100));
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
