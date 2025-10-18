import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-current-user',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <div class="nav-item nav-link disabled" style="display:flex; gap:0.5rem; align-items:center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#6c757d"/>
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="#6c757d"/>
      </svg>
      <span *ngIf="email">{{ email }}</span>
    </div>
  `,
})
export class CurrentUserComponent {
  private authService = inject(AuthService);
  get email(): string | null {
    return this.authService.getUserEmail();
  }
}
