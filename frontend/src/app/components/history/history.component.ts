import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { QueryService } from '../../services/query.service';
import { QueryHistoryItem } from '../../models/query.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatExpansionModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  history: QueryHistoryItem[] = [];
  loading = true;

  constructor(private queryService: QueryService) {}

  ngOnInit(): void {
    this.queryService.getHistory().subscribe({
      next: (data) => { this.history = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
