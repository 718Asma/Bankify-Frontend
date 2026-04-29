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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email()        { return this.form.get('email') as FormControl; }
  get password() { return this.form.get('password') as FormControl; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload = {
      ...this.form.value,
      userType: 'AGENT'
    };

    this.loading = true;
    this.auth.login(payload).subscribe({
      next: (res) => {
        this.loading = false;
        const route = '/app/dashboard/agent';
        this.router.navigate([route]);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.status === 401
          ? 'email ou mot de passe incorrect.'
          : 'Une erreur est survenue. Veuillez rÃ©essayer.';
        this.notify.error(msg);
      },
    });
  }
}