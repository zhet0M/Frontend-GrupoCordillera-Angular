import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { ClientsService } from '../../../../core/clients/clients.service';
import { Client, ClientRequest, ClientType, ClientState } from '../../../../core/clients/clients.models';

@Component({
  selector: 'app-clients-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients-panel.component.html',
  styleUrl: './clients-panel.component.css',
})
export class ClientsPanelComponent {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly clients = signal<Client[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchQuery = signal('');
  
  protected readonly showForm = signal(false);
  protected readonly editingClient = signal<Client | null>(null);

  protected readonly hasWriteAccess = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN_CLIENTES';
  });

  protected readonly filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.clients();

    if (!query) {
      return all;
    }

    return all.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.apellido.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.telefono.includes(query)
    );
  });

  protected readonly totalPurchases = computed(() => {
    return this.filteredClients().reduce((sum, client) => sum + (client.cantidadCompras || 0), 0);
  });

  protected readonly totalAccumulated = computed(() => {
    return this.filteredClients().reduce((sum, client) => sum + (client.montoAcumulado || 0), 0);
  });

  protected readonly clientForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    tipoCliente: ['REGULAR' as ClientType, [Validators.required]],
    estado: ['ACTIVO' as ClientState, [Validators.required]],
  });

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientsService
      .getClients()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.clients.set(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected openNewClientForm(): void {
    this.editingClient.set(null);
    this.clientForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      tipoCliente: 'REGULAR',
      estado: 'ACTIVO'
    });
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected openEditForm(client: Client): void {
    this.editingClient.set(client);
    this.clientForm.patchValue({
      nombre: client.nombre,
      apellido: client.apellido,
      email: client.email,
      telefono: client.telefono,
      direccion: client.direccion,
      tipoCliente: client.tipoCliente,
      estado: client.estado
    });
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected submitForm(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.clientForm.getRawValue() as ClientRequest;
    const editingId = this.editingClient()?.id;

    const request$ = editingId
      ? this.clientsService.updateClient(editingId, formValue)
      : this.clientsService.createClient(formValue);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: (savedClient) => {
        const action = editingId ? 'actualizado' : 'registrado';
        this.successMessage.set(`Cliente ${savedClient.nombre} ${savedClient.apellido} ${action} con exito.`);
        this.closeForm();
        this.loadData();
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
      },
    });
  }
}
