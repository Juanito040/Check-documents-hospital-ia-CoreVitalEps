import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule,
    MatSlideToggleModule, MatMenuModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  currentUserId: string | null = null;
  displayedColumns = ['nombre', 'email', 'rol', 'status', 'actions'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id ?? null;
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('No se pudieron cargar los usuarios'); }
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(UserFormComponent, { data: {}, width: '440px', panelClass: 'cv-dialog-panel' });
    ref.afterClosed().subscribe(result => { if (result) { this.loadUsers(); this.toast.success('Usuario creado correctamente'); } });
  }

  openEdit(user: User): void {
    const ref = this.dialog.open(UserFormComponent, { data: { user }, width: '440px', panelClass: 'cv-dialog-panel' });
    ref.afterClosed().subscribe(result => { if (result) { this.loadUsers(); this.toast.success('Usuario actualizado'); } });
  }

  openDetail(user: User): void {
    this.dialog.open(UserDetailComponent, { data: user, width: '420px', panelClass: 'cv-dialog-panel' });
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.currentUserId;
  }

  toggleActive(user: User): void {
    if (this.isCurrentUser(user)) return;
    this.userService.updateUser(user.id, { activo: !user.activo }).subscribe({
      next: () => {
        this.toast.success(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
        this.loadUsers();
      },
      error: () => this.toast.error('Error al cambiar el estado del usuario')
    });
  }

  deleteUser(user: User): void {
    if (this.isCurrentUser(user)) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar usuario',
        message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
        detail: user.nombre,
        confirmLabel: 'Sí, eliminar',
        type: 'danger'
      },
      width: '380px',
      panelClass: 'confirm-dialog-panel'
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.userService.deleteUser(user.id).subscribe({
        next: () => { this.toast.success('Usuario eliminado'); this.loadUsers(); },
        error: () => this.toast.error('Error al eliminar el usuario')
      });
    });
  }
}
