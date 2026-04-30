import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AgentAccountService } from '../../../core/services/agent-account.service';
import { ClientAgentService } from '../../../core/services/client-agent.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ClientDetail } from '../../../core/models/agent.models';

@Component({
  selector: 'app-open-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './open-account.component.html',
  styleUrl: './open-account.component.css',
})
export class OpenAccountComponent implements OnInit {
  form: FormGroup;
  loading        = false;
  cinChecking    = false;
  selectedClient: ClientDetail | null = null;
  cinError       = '';
  generatedRib   = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AgentAccountService,
    private clientService: ClientAgentService,
    private notify: NotificationService,
  ) {
    this.form = this.fb.group({
      cin:          ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      type:         ['', Validators.required],
      soldeInitial: [0, [Validators.min(0)]],
    });
  }

  get cin()          { return this.form.get('cin')          as FormControl; }
  get type()         { return this.form.get('type')         as FormControl; }
  get soldeInitial() { return this.form.get('soldeInitial') as FormControl; }

  get canSubmit(): boolean {
    return !!this.selectedClient && this.form.valid && !this.loading;
  }

  ngOnInit(): void {
    // Pre-fill CIN from query param (coming from client-detail page)
    const cinParam = this.route.snapshot.queryParamMap.get('cin');
    if (cinParam) {
      this.cin.setValue(cinParam);
      this.lookupClient();
    }
  }

  lookupClient(): void {
    const cinVal = this.cin.value;
    if (!cinVal || this.cin.invalid) return;

    this.cinChecking    = true;
    this.selectedClient = null;
    this.cinError       = '';

    this.clientService.getClientByCIN(Number(cinVal)).subscribe({
      next: (client) => {
        this.selectedClient = client;
        this.cinChecking    = false;
      },
      error: (err) => {
        this.cinChecking = false;
        this.cinError    = err.status === 404
          ? 'Aucun client trouvé avec ce CIN.'
          : 'Erreur lors de la recherche.';
      },
    });
  }

  /** Generate a Tunisian-style RIB: TN + 20 random digits */
  private generateRib(): string {
    const digits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');
    return `TN${digits}`;
  }

  submit(): void {
    if (!this.selectedClient || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rib = this.generateRib();
    this.generatedRib = rib;
    this.loading = true;

    const payload = {
      rib,
      type:         this.type.value as 'COURANT' | 'EPARGNE',
      soldeInitial: this.soldeInitial.value ?? 0,
      clientCin:    Number(this.cin.value),
    };

    this.accountService.openAccount(payload).subscribe({
      next: (account) => {
        this.loading = false;
        this.notify.success(`Compte ${account.rib} ouvert avec succès.`);
        this.router.navigate(['/app/agent/accounts', account.rib]);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.error ?? err.error?.message ?? 'Erreur lors de la création du compte.';
        this.notify.error(msg);
      },
    });
  }

  goBack(): void {
    if (this.selectedClient) {
      this.router.navigate(['/app/agent/clients', this.selectedClient.cin]);
    } else {
      this.router.navigate(['/app/agent/clients']);
    }
  }
}