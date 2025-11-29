import { Injectable, inject, signal, computed } from "@angular/core";
import { Cv } from "../model/cv";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API } from "../../../config/api.config";
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: "root",
})
export class CvService {
  private http = inject(HttpClient);

  private cvs: Cv[] = [];

  private refreshTrigger = signal(0);
  
  readonly cvsResource = rxResource({
    request: () => this.refreshTrigger(),
    loader: () => this.http.get<Cv[]>(API.cv)
  });
  
  private selectedCvSignal = signal<Cv | null>(null);
  
  public cvs$ = computed(() => {
    const data = this.cvsResource.value();
    if (data) return data;
    if (this.cvsResource.error()) return this.getFakeCvs();
    return [];
  });
  
  public selectedCv$ = computed(() => this.selectedCvSignal());
  
  public loading = computed(() => this.cvsResource.isLoading());
  
  public error = computed(() => {
    const err = this.cvsResource.error();
    return err ? 'Attention!! Les données sont fictives, problème avec le serveur.' : null;
  });

  constructor() {
    this.cvs = [
      new Cv(1, "aymen", "sellaouti", "teacher", "as.jpg", "1234", 40),
      new Cv(2, "skander", "sellaouti", "enfant", "       ", "1234", 4),
    ];
  }

  getFakeCvs(): Cv[] {
    return this.cvs;
  }

  // Not needed: getCvs() (use rxResource)

  deleteCvById(id: number): Observable<any> {
    return this.http.delete<any>(API.cv + id);
  }

  addCv(cv: Cv): Observable<Cv> {
    return this.http.post<any>(API.cv, cv);
  }

  getCvById(id: number): Observable<Cv> {
    return this.http.get<Cv>(API.cv + id);
  }


  selectCvWithSignal(cv: Cv | null): void {
    this.selectedCvSignal.set(cv);
  }

  refreshCvs(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  removeCvFromList(cvId: number): void {
    this.refreshCvs();
  }

  addCvToList(cv: Cv): void {
    this.refreshCvs();
  }
}
