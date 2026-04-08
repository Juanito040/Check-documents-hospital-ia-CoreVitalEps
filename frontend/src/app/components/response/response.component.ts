import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { QueryResponse } from '../../models/query.model';

@Component({
  selector: 'app-response',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './response.component.html',
  styleUrl: './response.component.css'
})
export class ResponseComponent {
  @Input() response!: QueryResponse;
  showSources = false;
}
