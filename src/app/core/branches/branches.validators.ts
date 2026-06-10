import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ALLOWED_BRANCHES } from './branches.models';

export function allowedBranchValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value?.trim().toUpperCase();

    if (!value) {
      return null;
    }

    return ALLOWED_BRANCHES.includes(value as (typeof ALLOWED_BRANCHES)[number])
      ? null
      : { allowedBranch: true };
  };
}
