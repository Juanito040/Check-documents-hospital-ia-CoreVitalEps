import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" [class.fullscreen]="fullscreen">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      @if (message) {
        <p class="message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }
    .loading-overlay.fullscreen {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.85);
      z-index: 9999;
    }
    .message {
      color: #757575;
      font-size: 0.9rem;
      margin: 0;
    }
  `]
})
export class LoadingComponent {
  @Input() message = '';
  @Input() diameter = 48;
  @Input() fullscreen = false;
}
