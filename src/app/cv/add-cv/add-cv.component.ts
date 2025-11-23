import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CvService } from '../services/cv.service';
import { cinUniqueValidator } from '../validators/cin-unique.validator';
import { cinAgeValidator } from '../validators/cin-age.validator';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from 'src/config/routes.config';
import { Cv } from '../model/cv';

@Component({
  selector: 'app-add-cv',
  templateUrl: './add-cv.component.html',
  styleUrls: ['./add-cv.component.css'],
})
export class AddCvComponent implements OnInit, OnDestroy {
  constructor(
    private cvService: CvService,
    private router: Router,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {}

  form = this.formBuilder.group({
    name: ['', Validators.required],
    firstname: ['', Validators.required],
    path: [''],
    job: ['', Validators.required],
    cin: [
      '',
      {
        validators: [
          Validators.required,
          Validators.pattern('[0-9]{8}'),
          cinAgeValidator(),
        ],
      },
    ],
    age: [
      0,
      {
        validators: [Validators.required],
      },
    ],
  });

  private readonly DRAFT_KEY = 'addCv.form.draft';
  private destroy$ = new Subject<void>();
  // bound handler so we can remove listener later
  private beforeUnloadHandler = this.handleBeforeUnload.bind(this);

  private saveDraft(): void {
    try {
      // only persist when the form is fully valid
      if (!this.form.valid) {
        return;
      }
      const toSave = this.form.getRawValue();
      const payload = {
        savedAt: new Date().toISOString(),
        isValid: true,
        data: toSave,
      };
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  ngOnInit(): void {
    // watch age and disable the path input when person is a minor (<18)
    this.age.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      const ageNum = Number(val) || 0;
      const pathControl = this.form.get('path');
      if (ageNum < 18) {
        // clear and disable the path control for minors
        pathControl?.setValue('');
        pathControl?.disable({ emitEvent: false });
      } else {
        // enable it for adults
        pathControl?.enable({ emitEvent: false });
      }
      // when age changes, revalidate CIN because validator depends on age
      this.form.get('cin')?.updateValueAndValidity({ onlySelf: true });
    });

    // restore draft if present
    const raw = localStorage.getItem(this.DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        // If payload contains wrapper (savedAt/isValid/data), adapt accordingly
        const payload =
          draft && draft.data ? draft : { data: draft, isValid: false };
        this.form.patchValue(payload.data || {});
      } catch (e) {
        // ignore malformed data
        console.warn('Could not parse AddCv draft from storage', e);
      }
    }

    // save valid form as draft (debounced to avoid spamming storage)
    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveDraft();
      });

    // set async validator for cin (uniqueness)
    this.form
      .get('cin')
      ?.setAsyncValidators([cinUniqueValidator(this.cvService)]);
    // ensure validator runs at init
    this.form
      .get('cin')
      ?.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    // save draft when the user closes the tab or reloads (covers fast navigations)
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // initialize control state based on the default age value
    const initialAge = Number(this.age.value) || 0;
    if (initialAge < 18) {
      this.form.get('path')?.disable({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.saveDraft();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    this.saveDraft();
  }

  addCv() {
    this.cvService.addCv(this.form.value as Cv).subscribe({
      next: (cv) => {
        // clear saved draft on success
        try {
          localStorage.removeItem(this.DRAFT_KEY);
        } catch (e) {
          // ignore
        }
        this.router.navigate([APP_ROUTES.cv]);
        this.toastr.success(`Le cv ${cv.firstname} ${cv.name}`);
      },
      error: (err) => {
        this.toastr.error(
          `Une erreur s'est produite, Veuillez contacter l'admin`
        );
      },
    });
  }

  get name(): AbstractControl {
    return this.form.get('name')!;
  }
  get firstname() {
    return this.form.get('firstname');
  }
  get age(): AbstractControl {
    return this.form.get('age')!;
  }
  get job() {
    return this.form.get('job');
  }
  get path() {
    return this.form.get('path');
  }
  get cin(): AbstractControl {
    return this.form.get('cin')!;
  }
}
