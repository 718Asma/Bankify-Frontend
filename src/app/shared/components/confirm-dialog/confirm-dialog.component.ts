import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'warn' = red confirm button, 'primary' = gold (default) */
  variant?: 'warn' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  get confirmLabel(): string { return this.data.confirmLabel ?? 'Confirmer'; }
  get cancelLabel():  string { return this.data.cancelLabel  ?? 'Annuler';   }
  get variant():      string { return this.data.variant      ?? 'primary';   }

  confirm(): void { this.dialogRef.close(true);  }
  cancel():  void { this.dialogRef.close(false); }
}