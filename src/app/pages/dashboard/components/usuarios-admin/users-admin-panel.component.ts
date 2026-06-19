import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

import { UserRole } from '../../../../core/auth/auth.models';
import { ManagedUser } from '../../../../core/users/user-management.models';
import { UserManagementService } from '../../../../core/users/user-management.service';

import { AuthService } from '../../../../core/auth/auth.service';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_USUARIOS: 'Admin Usuarios',
  ADMIN_VENTAS: 'Admin Ventas',
  ADMIN_INVENTARIO: 'Admin Inventario',
  ADMIN_FINANZAS: 'Admin Finanzas',
  ADMIN_CLIENTES: 'Admin Clientes',
  EJECUTIVO: 'Ejecutivo',
  ANALISTA: 'Analista',
};

const STATUS_LABELS: Record<ManagedUser['estado'], string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  BLOQUEADO: 'Bloqueado',
};

@Component({
  selector: 'app-users-admin-panel',
  imports: [CommonModule],
  templateUrl: './users-admin-panel.component.html',
  styleUrl: './users-admin-panel.component.css',
})
export class UsersAdminPanelComponent {
  private readonly userManagementService = inject(UserManagementService);
  private readonly authService = inject(AuthService);

  protected readonly users = signal<ManagedUser[]>([]);
  protected readonly assignableRoles = signal<UserRole[]>([]);
  protected readonly selectedRoles = signal<Record<number, UserRole>>({} as Record<number, UserRole>);
  protected readonly isLoading = signal(true);
  protected readonly actionUserId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchQuery = signal('');
  protected readonly isCurrentUserSuperAdmin = computed(() => this.authService.getUserRole() === 'SUPER_ADMIN');

  protected readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allUsers = this.users();

    if (!query) {
      return allUsers;
    }

    return allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  });

  protected readonly pendingUsers = computed(() =>
    this.filteredUsers().filter((user) => user.estado === 'PENDIENTE'),
  );
  protected readonly approvedUsers = computed(() =>
    this.filteredUsers().filter((user) => user.estado === 'APROBADO'),
  );
  protected readonly blockedUsers = computed(() =>
    this.filteredUsers().filter((user) => user.estado === 'BLOQUEADO'),
  );

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userManagementService
      .getAssignableRoles()
      .subscribe({
        next: (roles) => {
          this.assignableRoles.set(roles);
          this.loadUsers();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected approveUser(userId: number): void {
    const selectedRole = this.selectedRoles()[userId];

    if (!selectedRole) {
      this.errorMessage.set('Selecciona un rol antes de aprobar al usuario.');
      return;
    }

    this.runAction(userId, () => this.userManagementService.approveUser(userId, selectedRole), 'Usuario aprobado correctamente.');
  }

  protected rejectUser(userId: number): void {
    this.runAction(userId, () => this.userManagementService.rejectUser(userId), 'Usuario rechazado correctamente.');
  }

  protected blockUser(userId: number): void {
    this.runAction(userId, () => this.userManagementService.blockUser(userId), 'Usuario bloqueado correctamente.');
  }

  protected unblockUser(userId: number): void {
    this.runAction(userId, () => this.userManagementService.unblockUser(userId), 'Usuario desbloqueado correctamente.');
  }

  protected updateSelectedRole(userId: number, role: string): void {
    if (!role) {
      return;
    }

    this.selectedRoles.update((current) => ({
      ...current,
      [userId]: role as UserRole,
    }));
  }

  protected getRoleLabel(role: UserRole | null): string {
    return role ? ROLE_LABELS[role] : 'Sin asignar';
  }

  protected getStatusLabel(status: ManagedUser['estado']): string {
    return STATUS_LABELS[status];
  }

  protected isBusy(userId: number): boolean {
    return this.actionUserId() === userId;
  }

  protected isActionDisabled(user: ManagedUser): boolean {
    if (this.isBusy(user.id)) {
      return true;
    }
    if (user.rol === 'SUPER_ADMIN' && !this.isCurrentUserSuperAdmin()) {
      return true;
    }
    return false;
  }

  private loadUsers(): void {
    this.userManagementService
      .getUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.seedSelectedRoles(users);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  private seedSelectedRoles(users: ManagedUser[]): void {
    const fallbackRole = this.assignableRoles()[0];

    const selectedRoles = users.reduce<Record<number, UserRole>>((acc, user) => {
      const role = user.rol ?? fallbackRole;

      if (role) {
        acc[user.id] = role;
      }

      return acc;
    }, {});

    this.selectedRoles.set(selectedRoles);
  }

  private runAction(
    userId: number,
    requestFactory: () => Observable<ManagedUser>,
    successMessage: string,
  ): void {
    this.actionUserId.set(userId);
    this.errorMessage.set('');
    this.successMessage.set('');

    requestFactory()
      .pipe(finalize(() => this.actionUserId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(successMessage);
          this.loadUsers();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }
}
