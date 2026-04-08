import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Source } from '../../models/query.model';

export interface Message {
  type: 'user' | 'assistant';
  text: string;
  sources?: Source[];
  response_time_ms?: number;
  timestamp: Date;
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() userInitial: string = '?';
  showSources = false;
}
