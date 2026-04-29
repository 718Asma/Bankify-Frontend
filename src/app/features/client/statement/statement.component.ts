import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../core/services/account.service';
import { StatementService } from '../../../core/services/statement.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Compte } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './statement.component.html',
  styleUrl: './statement.component.css',
})
export class StatementComponent implements OnInit {
  form: FormGroup;
  accounts: Compte[] = [];
  loadingAccounts = true;
  loadingDownload = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private statementService: StatementService,
    private notify: NotificationService,
  ) {
    this.form = this.fb.group({
      rib:       ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin:   ['', Validators.required],
    });
  }

  get rib()       { return this.form.get('rib') as FormControl; }
  get dateDebut() { return this.form.get('dateDebut') as FormControl; }
  get dateFin()   { return this.form.get('dateFin') as FormControl; }

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => { this.accounts = data.filter(a => a.statut === 'ACTIF'); this.loadingAccounts = false; },
      error: ()    => { this.loadingAccounts = false; this.notify.error('Impossible de charger les comptes.'); },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { rib, dateDebut, dateFin } = this.form.value;

    if (new Date(dateFin) < new Date(dateDebut)) {
      this.notify.error('La date de fin doit être après la date de début.');
      return;
    }

    this.loadingDownload = true;
    this.statementService.downloadStatement({ rib, dateDebut, dateFin }).subscribe({
      next: (blob) => {
        this.statementService.saveFile(blob, rib, dateDebut, dateFin);
        this.loadingDownload = false;
        this.notify.success('Relevé téléchargé avec succès.');
      },
      error: () => {
        this.loadingDownload = false;
        this.notify.error('Erreur lors du téléchargement du relevé.');
      },
    });
  }
}