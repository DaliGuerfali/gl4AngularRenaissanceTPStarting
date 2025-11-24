import {
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CvService } from '../services/cv.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/**
 * Async validator that checks whether a CIN value is already present.
 * Uses `CvService.selectByProperty('cin', value)` which should return an array.
 */
export function cinUniqueValidator(cvService: CvService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const val = control.value;
    if (val == null || val === '') {
      return of(null);
    }
    return cvService.selectByProperty('cin', String(val)).pipe(
      map((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          return { cinTaken: true };
        }
        return null;
      })
    );
  };
}
