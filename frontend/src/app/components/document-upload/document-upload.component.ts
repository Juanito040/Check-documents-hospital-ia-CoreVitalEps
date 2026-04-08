import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DocumentUploadResponse } from '../../models/document.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.css'
})
export class DocumentUploadComponent {
  @Output() uploaded = new EventEmitter<DocumentUploadResponse>();

  uploading = false;
  dragOver = false;
  categoria = 'protocolo';
  categorias = [
    { value: 'protocolo',       label: 'Protocolo' },
    { value: 'normativa',       label: 'Normativa' },
    { value: 'historia_clinica',label: 'Historia Clínica' }
  ];

  constructor(private documentService: DocumentService, private toast: ToastService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.uploadFile(input.files[0]); input.value = ''; }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }

  private uploadFile(file: File): void {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      this.toast.warning('Solo se permiten archivos PDF o DOCX');
      return;
    }

    this.uploading = true;
    this.documentService.uploadDocument(file, this.categoria).subscribe({
      next: (response) => {
        this.uploading = false;
        this.toast.success(`"${response.filename}" subido — ${response.chunks_created} fragmentos generados`);
        this.uploaded.emit(response);
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.detail || 'Error al subir el archivo');
      }
    });
  }
}
