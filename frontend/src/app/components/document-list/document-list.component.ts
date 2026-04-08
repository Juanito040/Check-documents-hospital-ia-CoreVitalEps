import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { DocumentDetailComponent } from '../document-detail/document-detail.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule,
    MatMenuModule, DocumentUploadComponent],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  loading = true;
  displayedColumns = ['nombre_archivo', 'categoria', 'num_chunks', 'fecha_carga', 'actions'];

  constructor(
    private documentService: DocumentService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.loadDocuments(); }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (docs) => { this.documents = docs; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('No se pudieron cargar los documentos'); }
    });
  }

  openDetail(doc: Document): void {
    this.dialog.open(DocumentDetailComponent, { data: doc, width: '460px', panelClass: 'cv-dialog-panel' });
  }

  deleteDocument(doc: Document): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar documento',
        message: '¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.',
        detail: doc.nombre_archivo,
        confirmLabel: 'Sí, eliminar',
        type: 'danger'
      },
      width: '380px',
      panelClass: 'confirm-dialog-panel'
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => { this.toast.success('Documento eliminado correctamente'); this.loadDocuments(); },
        error: (err) => { this.toast.error(err.error?.detail || 'Error al eliminar el documento'); }
      });
    });
  }

  getCategoriaLabel(cat: string): string {
    const map: Record<string, string> = {
      protocolo: 'Protocolo',
      normativa: 'Normativa',
      historia_clinica: 'Historia Clínica'
    };
    return map[cat] || cat;
  }
}
