import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { ChatInterfaceComponent } from '../chat-interface/chat-interface.component';
import { HistoryComponent } from '../history/history.component';
import { User } from '../../models/user.model';

export interface ChatWindow {
  id: number;
  title: string;
  minimized: boolean;
}

const WINDOWS_KEY = 'cv_windows';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatMenuModule,
    ChatInterfaceComponent,
    HistoryComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeView: 'chat' | 'history' = 'chat';
  chatWindows: ChatWindow[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.restoreWindows();
    if (this.chatWindows.length === 0) {
      this.openNewChat();
    }
  }

  private nextAvailableId(): number {
    const used = new Set(this.chatWindows.map(w => w.id));
    return [1, 2, 3].find(n => !used.has(n))!;
  }

  openNewChat(): void {
    if (this.chatWindows.length >= 3) return;
    const id = this.nextAvailableId();
    this.chatWindows.push({ id, title: `Consulta ${id}`, minimized: false });
    this.activeView = 'chat';
    this.saveWindows();
  }

  toggleMinimize(id: number): void {
    const win = this.chatWindows.find(w => w.id === id);
    if (win) { win.minimized = !win.minimized; this.saveWindows(); }
  }

  closeChat(id: number): void {
    localStorage.removeItem(`cv_chat_${id}`);
    this.chatWindows = this.chatWindows.filter(w => w.id !== id);
    this.saveWindows();
  }

  private saveWindows(): void {
    localStorage.setItem(WINDOWS_KEY, JSON.stringify(this.chatWindows));
  }

  private restoreWindows(): void {
    try {
      const raw = localStorage.getItem(WINDOWS_KEY);
      if (raw) this.chatWindows = JSON.parse(raw);
    } catch {
      this.chatWindows = [];
    }
  }

  logout(): void {
    // Limpiar estado de chat al cerrar sesión
    [1, 2, 3].forEach(i => localStorage.removeItem(`cv_chat_${i}`));
    localStorage.removeItem(WINDOWS_KEY);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canOpenMore(): boolean {
    return this.chatWindows.length < 3;
  }
}
