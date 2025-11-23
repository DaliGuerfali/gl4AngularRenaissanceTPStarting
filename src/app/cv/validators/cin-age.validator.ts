import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator that enforces correlation between age and the first two digits of CIN.
 * - If age >= 60 -> first two digits must be between 00 and 19 (inclusive)
 * - Otherwise -> first two digits must be > 19 (i.e. 20..99)
 */
export function cinAgeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // if no value or not 8 digits, skip validation here (pattern validator handles format)
    if (value == null || value === '' || !/^\d{8}$/.test(String(value))) {
      return null;
    }

    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const ageCtrl = parent.get('age');
    if (!ageCtrl) {
      return null;
    }
    const age = Number(ageCtrl.value);
    if (isNaN(age)) {
      return null;
    }

    const firstTwo = parseInt(String(value).substring(0, 2), 10);
    if (isNaN(firstTwo)) {
      return { cinAgeMismatch: true };
    }

    if (age >= 60) {
      if (firstTwo >= 0 && firstTwo <= 19) {
        return null;
      }
      return { cinAgeMismatch: true };
    }

    // age < 60 -> firstTwo must be > 19
    if (firstTwo > 19) {
      return null;
    }

    return { cinAgeMismatch: true };
  };
}
