import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, AbstractControl } from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  filter as rxFilter,
} from "rxjs";
import { of } from "rxjs";
import { CvService } from "../services/cv.service";
import { Cv } from "../model/cv";

@Component({
  selector: "app-autocomplete",
  templateUrl: "./autocomplete.component.html",
  styleUrls: ["./autocomplete.component.css"],
})
export class AutocompleteComponent {
  formBuilder = inject(FormBuilder);
  cvService = inject(CvService);
  // les résultats renvoyés par le serveur
  results: Cv[] = [];
  // cv sélectionné dans la liste
  selectedCv: Cv | null = null;
  private cache = new Map<string, Cv[]>();
  get search(): AbstractControl {
    return this.form.get("search")!;
  }
  form = this.formBuilder.group({ search: [""] });

  ngOnInit() {
    // Mark: subscribe to value changes and perform a debounced, distinct search
    this.search.valueChanges
      .pipe(
        // don't search for the exact same value
        distinctUntilChanged(),
        // wait a bit for the user to finish typing
        debounceTime(300),
        // ignore empty or whitespace-only searches to avoid spamming server
        rxFilter((value: string) => !!value && value.trim().length > 0),
        tap(() => {
          this.selectedCv = null; // clear selection when typing
        }),
        switchMap((value: string) => {
          const q = value.trim();
          // return cached value if present
          if (this.cache.has(q)) {
            return of(this.cache.get(q)!);
          }
          // call the service and cache the results
          return this.cvService.selectByName(q).pipe(
            catchError(() => of([] as Cv[])),
            tap((res: any) => {
              // store in cache (expect array)
              try {
                const cvs: Cv[] = Array.isArray(res) ? res : res.data ?? res;
                this.cache.set(q, cvs);
              } catch (e) {
                this.cache.set(q, []);
              }
            }),
          );
        })
      )
      .subscribe((cvs: Cv[]) => {
        this.results = cvs ?? [];
        // publish results so parent page can react (and hide the main list if needed)
        this.cvService.setSearchResults(this.results.length ? this.results : null);
      });

    // when input is cleared, make sure to clear results and notify the service
    this.search.valueChanges.pipe(debounceTime(50)).subscribe((value: string) => {
      if (!value || !value.trim()) {
        this.results = [];
        this.cvService.setSearchResults(null);
      }
    });
  }

  // when user selects one value
  select(cv: Cv) {
    this.selectedCv = cv;
    this.results = [];
    // also push into the shared service stream so other components can react
    this.cvService.selectCv(cv);
    // set the input value to the selected name
    this.form.patchValue({ search: `${cv.firstname} ${cv.name}` }, { emitEvent: false });
  }
}
