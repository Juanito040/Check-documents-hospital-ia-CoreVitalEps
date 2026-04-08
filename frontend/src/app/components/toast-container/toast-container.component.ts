import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: (Toast & { removing: boolean })[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      const entry = { ...toast, removing: false };
      this.toasts.push(entry);
      setTimeout(() => this.remove(toast.id), toast.duration);
    });
  }

  remove(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (!t) return;
    t.removing = true;
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 350);
  }

  icon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'i'
    };
    return icons[type] ?? 'i';
  }

  label(type: string): string {
    const labels: Record<string, string> = {
      success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Info'
    };
    return labels[type] ?? '';
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}
