import { Injectable, inject, signal, computed } from "@angular/core";
import { Cv } from "../model/cv";
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { API } from "../../../config/api.config";
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: "root",
})
export class CvService {
  private http = inject(HttpClient);

  private cvs: Cv[] = [];

  // 🚀 SIGNALS - Remplacement des Subject/Observable par des signaux
  
  /**
   * Signal pour stocker la liste des CVs
   */
  private cvsSignal = signal<Cv[]>([]);
  
  /**
   * Signal pour le CV sélectionné
   */
  private selectedCvSignal = signal<Cv | null>(null);
  
  /**
   * Signal en lecture seule pour les CVs (computed pour optimisation)
   */
  public cvs$ = computed(() => this.cvsSignal());
  
  /**
   * Signal en lecture seule pour le CV sélectionné
   */
  public selectedCv$ = computed(() => this.selectedCvSignal());
  
  /**
   * Signal pour l'état de chargement
   */
  public loading = signal<boolean>(false);
  
  /**
   * Signal pour les erreurs
   */
  public error = signal<string | null>(null);

  // 🔄 Garde la compatibilité avec l'ancien système Observable pour la rétrocompatibilité
  #selectCvSuject$ = new Subject<Cv>();
  selectCvObservable$ = this.#selectCvSuject$.asObservable();
  constructor() {
    this.cvs = [
      new Cv(1, "aymen", "sellaouti", "teacher", "as.jpg", "1234", 40),
      new Cv(2, "skander", "sellaouti", "enfant", "       ", "1234", 4),
    ];
  }

  /**
   *
   * Retourne un liste fictive de cvs
   *
   * @returns CV[]
   *
   */
  getFakeCvs(): Cv[] {
    return this.cvs;
  }

  /**
   *
   * Retourne la liste des cvs de l'API
   *
   * @returns CV[]
   *
   */
  getCvs(): Observable<Cv[]> {
    return this.http.get<Cv[]>(API.cv);
  }

  /**
   *
   * supprime un cv par son id de l'API
   *
   * @param id: number
   * @returns CV[]
   *
   */
  deleteCvById(id: number): Observable<any> {
    return this.http.delete<any>(API.cv + id);
  }

  addCv(cv: Cv): Observable<Cv> {
    return this.http.post<any>(API.cv, cv);
  }

  /**
   *
   * Retourne un cv par son id de l'API
   *
   * @param id: number
   * @returns CV[]
   *
   */
  getCvById(id: number): Observable<Cv> {
    return this.http.get<Cv>(API.cv + id);
  }

  /**
   *
   * Cherche un cv avec son id dans lai liste fictive de cvs
   *
   * @param id
   * @returns Cv | null
   */
  findCvById(id: number): Cv | null {
    return this.cvs.find((cv) => cv.id == id) ?? null;
  }

  /**
   *
   * Supprime un cv s'il le trouve
   *
   * @param cv : Cv
   * @returns boolean
   */
  deleteCv(cv: Cv): boolean {
    const index = this.cvs.indexOf(cv);
    if (index > -1) {
      this.cvs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Recherche les cvs dont le name contient la chaine name passée en paramètre
   * @param name : string
   * @returns cvs Cv[]
   */
  selectByName(name: string) {
    const search = `{"where":{"name":{"like":"%${name}%"}}}`;
    const params = new HttpParams().set("filter", search);
    return this.http.get<any>(API.cv, { params });
  }
  /**
   * Recherche les cvs dont la valeur est égale à la chaine passée en paramètre
   * @param property : string, la propriété sur laquelle on va requeter
   * @param value : string, la valeur de la propriété sur laquelle on va requeter
   * @returns cvs Cv[]
   */
  selectByProperty(property: string, value: string) {
    const search = `{"where":{"${property}":"${value}"}}`;
    const params = new HttpParams().set("filter", search);
    return this.http.get<Cv[]>(API.cv, { params });
  }

  /**
   * Permet d'ajouter un cv au flux des cvs sélectionnés (Ancienne méthode Observable)
   *
   * @param cv : Le cv à ajouter dans le flux des cvs sélectionnés
   */
  selectCv(cv: Cv) {
    this.#selectCvSuject$.next(cv);
  }

  // 🚀 NOUVELLES MÉTHODES BASÉES SUR LES SIGNAUX

  /**
   * Met à jour la liste des CVs dans le signal
   * @param cvs Liste des CVs à stocker
   */
  setCvs(cvs: Cv[]): void {
    this.cvsSignal.set(cvs);
    this.error.set(null); // Reset error on successful load
  }

  /**
   * Sélectionne un CV avec les signaux
   * @param cv Le CV à sélectionner
   */
  selectCvWithSignal(cv: Cv | null): void {
    this.selectedCvSignal.set(cv);
  }

  /**
   * Met à jour l'état de chargement
   * @param isLoading État de chargement
   */
  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }

  /**
   * Met à jour l'état d'erreur
   * @param error Message d'erreur ou null
   */
  setError(error: string | null): void {
    this.error.set(error);
  }

  /**
   * Supprime un CV de la liste locale (signal) après suppression réussie
   * @param cvId ID du CV à supprimer
   */
  removeCvFromList(cvId: number): void {
    const currentCvs = this.cvsSignal();
    const filteredCvs = currentCvs.filter(cv => cv.id !== cvId);
    this.cvsSignal.set(filteredCvs);
  }

  /**
   * Ajoute un CV à la liste locale (signal) après ajout réussi
   * @param cv CV à ajouter
   */
  addCvToList(cv: Cv): void {
    const currentCvs = this.cvsSignal();
    this.cvsSignal.set([...currentCvs, cv]);
  }

  /**
   * Charge les CVs avec gestion des signaux
   */
  loadCvsWithSignals(): void {
    this.setLoading(true);
    this.setError(null);
    
    this.getCvs().subscribe({
      next: (cvs) => {
        this.setCvs(cvs);
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des CVs:', error);
        this.setCvs(this.getFakeCvs()); // Fallback vers les données fictives
        this.setError('Attention!! Les données sont fictives, problème avec le serveur.');
        this.setLoading(false);
      }
    });
  }
}
