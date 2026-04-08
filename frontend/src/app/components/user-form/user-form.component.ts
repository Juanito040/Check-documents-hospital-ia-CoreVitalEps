import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { parseHttpError } from '../../utils/http-error.util';

export interface UserFormData { user?: User; }

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit: boolean;
  isOwnAccount: boolean;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.isEdit = !!data?.user;
    const currentUser = this.authService.getCurrentUser();
    this.isOwnAccount = this.isEdit && data?.user?.id === currentUser?.id;

    this.form = this.fb.group({
      nombre: [data?.user?.nombre || '', Validators.required],
      email: [data?.user?.email || '', [Validators.required, Validators.email]],
      rol: [data?.user?.rol || 'medico', Validators.required],
      ...(!this.isEdit ? { password: ['', [Validators.required, Validators.minLength(6)]] } : {})
    });
  }

  ngOnInit(): void {
    // Si está editando su propia cuenta, bloquear el campo rol
    if (this.isOwnAccount) {
      this.form.get('rol')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const value = this.form.getRawValue();

    const updatePayload = this.isOwnAccount
      ? { nombre: value.nombre, email: value.email }  // No se puede cambiar el propio rol
      : { nombre: value.nombre, email: value.email, rol: value.rol };

    const request$ = this.isEdit
      ? this.userService.updateUser(this.data.user!.id, updatePayload)
      : this.userService.createUser(value);

    request$.subscribe({
      next: (user) => {
        this.snackBar.open(this.isEdit ? 'Usuario actualizado' : 'Usuario creado', 'OK', { duration: 3000 });
        this.dialogRef.close(user);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(parseHttpError(err, 'Error al guardar'), 'Cerrar', { duration: 4000 });
      }
    });
  }
}
