import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      cin:        ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get cin()        { return this.form.get('cin') as FormControl; }
  get motDePasse() { return this.form.get('motDePasse') as FormControl; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        const route = res.role === 'AGENT' ? '/app/dashboard/agent' : '/app/dashboard/client';
        this.router.navigate([route]);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.status === 401
          ? 'CIN ou mot de passe incorrect.'
          : 'Une erreur est survenue. Veuillez réessayer.';
        this.notify.error(msg);
      },
    });
  }
}