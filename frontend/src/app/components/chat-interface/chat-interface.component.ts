import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { QueryService } from '../../services/query.service';
import { AuthService } from '../../services/auth.service';
import { parseHttpError } from '../../utils/http-error.util';
import { MessageComponent, Message } from '../message/message.component';
import { QueryInputComponent } from '../query-input/query-input.component';

const GREETING = '¡Hola! Soy el asistente del CoreVital. Puedo responder preguntas basadas en los documentos institucionales. ¿En qué te puedo ayudar?';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MessageComponent, QueryInputComponent],
  templateUrl: './chat-interface.component.html',
  styleUrl: './chat-interface.component.css'
})
export class ChatInterfaceComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() windowId = 0;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  loading = false;
  userInitial = '?';

  private querySub: Subscription | null = null;
  private get storageKey(): string { return `cv_chat_${this.windowId}`; }

  constructor(
    private queryService: QueryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.nombre) this.userInitial = user.nombre.trim().charAt(0).toUpperCase();
    this.authService.currentUser$.subscribe(u => {
      if (u?.nombre) this.userInitial = u.nombre.trim().charAt(0).toUpperCase();
    });

    const saved = this.loadMessages();
    if (saved.length > 0) {
      this.messages = saved;
    } else {
      this.messages.push({ type: 'assistant', text: GREETING, timestamp: new Date() });
      this.saveMessages();
    }
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onQuery(question: string): void {
    this.messages.push({ type: 'user', text: question, timestamp: new Date() });
    this.saveMessages();
    this.loading = true;

    this.querySub = this.queryService.sendQuery({ question }).subscribe({
      next: (response) => {
        this.messages.push({
          type: 'assistant',
          text: response.answer,
          sources: response.sources,
          response_time_ms: response.response_time_ms,
          timestamp: new Date()
        });
        this.loading = false;
        this.querySub = null;
        this.saveMessages();
      },
      error: (err) => {
        this.messages.push({
          type: 'assistant',
          text: parseHttpError(err, 'Ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.'),
          timestamp: new Date()
        });
        this.loading = false;
        this.querySub = null;
        this.saveMessages();
      }
    });
  }

  cancelQuery(): void {
    this.querySub?.unsubscribe();
    this.querySub = null;
    this.loading = false;
    this.messages.push({ type: 'assistant', text: 'Consulta cancelada.', timestamp: new Date() });
    this.saveMessages();
  }

  private saveMessages(): void {
    if (!this.windowId) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch {}
  }

  private loadMessages(): Message[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch { return []; }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
