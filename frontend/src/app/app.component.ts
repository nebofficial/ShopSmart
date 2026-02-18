import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header *ngIf="!isAdminRoute()"></app-header>
    <main class="main-content" [class.admin-layout]="isAdminRoute()">
      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="!isAdminRoute()"></app-footer>
  `,
  styles: [`
    .main-content { min-height: calc(100vh - 200px); }
    .admin-layout { min-height: 100vh; }
  `]
})
export class AppComponent {
  constructor(private router: Router) { }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
