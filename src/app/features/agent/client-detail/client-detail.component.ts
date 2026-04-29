import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientAgentService } from '../../../core/services/client-agent.service';
import { AgentAccountService } from '../../../core/services/agent-account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ClientDetail, AgentCompte } from '../../../core/models/agent.models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.css',
})
export class ClientDetailComponent implements OnInit {
  client: ClientDetail | null = null;
  accounts: AgentCompte[]     = [];
  form!: FormGroup;

  loadingData     = true;
  loadingSave     = false;
  loadingAccounts = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientAgentService,
    private accountService: AgentAccountService,
    private notify: NotificationService,
  ) {}

  get cin()       { return this.route.snapshot.paramMap.get('cin')!; }
  get prenom()    { return this.form.get('prenom')    as FormControl; }
  get nom()       { return this.form.get('nom')       as FormControl; }
  get email()     { return this.form.get('email')     as FormControl; }
  get telephone() { return this.form.get('telephone') as FormControl; }
  get dateNaiss() { return this.form.get('dateNaiss') as FormControl; }
  get adresse()   { return this.form.get('adresse')   as FormControl; }

  get initials(): string {
    if (!this.client) return '?';
    return `${this.client.prenom[0]}${this.client.nom[0]}`.toUpperCase();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      prenom:    ['', Validators.required],
      nom:       ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      dateNaiss: ['', Validators.required],
      adresse:   ['', Validators.required],
    });

    this.clientService.getClientByCIN(Number(this.cin)).subscribe({
      next: (data) => {
        this.client = data;
        this.form.patchValue({
          prenom:    data.prenom,
          nom:       data.nom,
          email:     data.email,
          telephone: data.telephone,
          dateNaiss: data.dateNaiss,
          adresse:   data.adresse,
        });
        this.loadingData = false;
        this.loadAccounts();
      },
      error: () => {
        this.loadingData = false;
        this.notify.error('Client introuvable.');
        this.router.navigate(['/app/agent/clients']);
      },
    });
  }

  loadAccounts(): void {
    this.accountService.getClientAccounts(Number(this.cin)).subscribe({
      next: (data) => { this.accounts = data; this.loadingAccounts = false; },
      error: ()    => { this.loadingAccounts = false; },
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loadingSave = true;
    const payload = {
      nom:       this.form.value.nom,
      prenom:    this.form.value.prenom,
      email:     this.form.value.email,
      telephone: Number(this.form.value.telephone),
      dateNaiss: this.form.value.dateNaiss,
      adresse:   this.form.value.adresse,
    };

    this.clientService.updateClient(Number(this.cin), payload).subscribe({
      next: (updated) => {
        this.client      = updated;
        this.loadingSave = false;
        this.form.markAsPristine();
        this.notify.success('Profil mis à jour avec succès.');
      },
      error: (err) => {
        this.loadingSave = false;
        this.notify.error(err.error?.message ?? 'Erreur lors de la mise à jour.');
      },
    });
  }

  getStatusClass(status: string): string {
    return status === 'ACTIF' ? 'st-actif' : status === 'BLOQUE' ? 'st-bloque' : 'st-ferme';
  }

  goBack(): void {
    this.router.navigate(['/app/agent/clients']);
  }
}