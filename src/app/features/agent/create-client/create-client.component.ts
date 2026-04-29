import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientAgentService } from '../../../core/services/client-agent.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './create-client.component.html',
  styleUrl: './create-client.component.css',
})
export class CreateClientComponent {
  form: FormGroup;
  loading     = false;
  cinChecking = false;
  cinAvailable: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientAgentService,
    private notify: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      cin:       ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      nom:       ['', Validators.required],
      prenom:    ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      dateNaiss: ['', Validators.required],
      adresse:   ['', Validators.required],
    });
  }

  get cin()       { return this.form.get('cin')       as FormControl; }
  get nom()       { return this.form.get('nom')       as FormControl; }
  get prenom()    { return this.form.get('prenom')    as FormControl; }
  get email()     { return this.form.get('email')     as FormControl; }
  get telephone() { return this.form.get('telephone') as FormControl; }
  get dateNaiss() { return this.form.get('dateNaiss') as FormControl; }
  get adresse()   { return this.form.get('adresse')   as FormControl; }

  checkCinUniqueness(): void {
    const cinVal = this.cin.value;
    if (!cinVal || this.cin.invalid) return;

    this.cinChecking  = true;
    this.cinAvailable = null;

    this.clientService.getClientByCIN(Number(cinVal)).subscribe({
      next: () => {
        // Client found → CIN taken
        this.cinAvailable = false;
        this.cinChecking  = false;
      },
      error: (err) => {
        // 404 → CIN free
        this.cinAvailable = err.status === 404 ? true : null;
        this.cinChecking  = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.cinAvailable === false) return;

    this.loading = true;
    const payload = {
      cin:        Number(this.form.value.cin),
      nom:        this.form.value.nom,
      prenom:     this.form.value.prenom,
      email:      this.form.value.email,
      telephone:  Number(this.form.value.telephone),
      dateNaiss:  this.form.value.dateNaiss,
      adresse:    this.form.value.adresse,
    };

    this.clientService.createClient(payload).subscribe({
      next: (client) => {
        this.loading = false;
        this.notify.success(`Client ${client.prenom} ${client.nom} créé avec succès.`);
        this.router.navigate(['/app/agent/clients', client.cin]);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message ?? err.error?.error ?? 'Erreur lors de la création.';
        this.notify.error(msg);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/agent/clients']);
  }
}