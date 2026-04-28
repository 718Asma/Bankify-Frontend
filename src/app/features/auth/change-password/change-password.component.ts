import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const newPw   = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  form: FormGroup;
  loadingSave = false;
  show = { current: false, newPw: false, confirm: false };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notify: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatch });
  }

  get current() { return this.form.get('currentPassword')! as FormControl; }
  get newPw()   { return this.form.get('newPassword')! as FormControl; }
  get confirm() { return this.form.get('confirmPassword')! as FormControl; }
  get mismatch(){ return this.form.errors?.['mismatch'] && this.confirm.touched; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loadingSave = true;
    const body = {
      ancienMotDePasse: this.form.value.currentPassword,
      nouveauMotDePasse: this.form.value.newPassword,
    };

    this.http.patch(`${environment.apiUrl}/api/clients/mot-de-passe`, body).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notify.success('Mot de passe modifié avec succès.');
        this.router.navigate(['/app/profile']);
      },
      error: (err) => {
        this.loadingSave = false;
        const msg = err.error?.message ?? 'Erreur lors du changement de mot de passe.';
        this.notify.error(msg);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}