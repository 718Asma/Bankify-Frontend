import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../environments/environment';

interface ClientProfile {
  cin:       string;
  nom:       string;
  prenom:    string;
  email:     string;
  telephone: string;
  adresse:   string;
  dateNaiss: string; // yyyy-MM-dd as returned by the backend
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  loadingData = true;
  loadingSave = false;
  profile: ClientProfile | null = null;

  private readonly apiUrl = `${environment.apiUrl}/api/clients/profil`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notify: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      cin:       [{ value: '', disabled: true }],
      nom:       ['', Validators.required],
      prenom:    ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      adresse:   ['', Validators.required],
      dateNaiss: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.http.get<ClientProfile>(this.apiUrl).subscribe({
      next: (data) => {
        this.profile = data;
        this.form.patchValue({
          ...data,
          // Ensure the date is trimmed to yyyy-MM-dd in case the backend
          // returns a datetime string like "1990-05-12T00:00:00"
          dateNaiss: data.dateNaiss ? data.dateNaiss.substring(0, 10) : '',
        });
        this.loadingData = false;
      },
      error: () => {
        this.loadingData = false;
        this.notify.error('Impossible de charger le profil.');
      },
    });
  }

  get nom()       { return this.form.get('nom') as FormControl; }
  get prenom()    { return this.form.get('prenom') as FormControl; }
  get email()     { return this.form.get('email') as FormControl; }
  get telephone() { return this.form.get('telephone') as FormControl; }
  get adresse()   { return this.form.get('adresse') as FormControl; }
  get dateNaiss() { return this.form.get('dateNaiss') as FormControl; }

  get initials(): string {
    if (!this.profile) return '?';
    return `${this.profile.prenom[0]}${this.profile.nom[0]}`.toUpperCase();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loadingSave = true;
    const { cin, ...body } = this.form.getRawValue();

    this.http.put(this.apiUrl, body).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notify.success('Profil mis à jour avec succès.');
      },
      error: (err) => {
        this.loadingSave = false;
        const msg = err.error?.message ?? 'Erreur lors de la mise à jour.';
        this.notify.error(msg);
      },
    });
  }

  goChangePassword(): void {
    this.router.navigate(['/app/profile/change-password']);
  }
}