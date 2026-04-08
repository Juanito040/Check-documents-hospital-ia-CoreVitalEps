import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatSidenavModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() opened = false;
  @Output() closeSidebar = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Consulta IA', icon: 'chat', route: '/dashboard' },
    { label: 'Documentos', icon: 'description', route: '/admin/documents', adminOnly: true },
    { label: 'Usuarios', icon: 'group', route: '/admin/users', adminOnly: true }
  ];

  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  get visibleItems(): NavItem[] {
    return this.navItems.filter(item => !item.adminOnly || this.isAdmin);
  }
}
