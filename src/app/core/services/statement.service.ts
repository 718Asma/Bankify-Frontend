import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatementRequest } from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class StatementService {
  private readonly base = `${environment.apiUrl}/api/releves`;

  constructor(private http: HttpClient) {}

  /** Download statement as PDF blob */
  downloadStatement(req: StatementRequest): Observable<Blob> {
    return this.http.get(`${this.base}/${req.rib}`, {
      params: { dateDebut: req.dateDebut, dateFin: req.dateFin },
      responseType: 'blob',
    });
  }

  /** Trigger browser file download from blob */
  saveFile(blob: Blob, rib: string, dateDebut: string, dateFin: string): void {
    const url      = URL.createObjectURL(blob);
    const anchor   = document.createElement('a');
    anchor.href    = url;
    anchor.download = `releve-${rib}-${dateDebut}-${dateFin}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}