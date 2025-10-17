import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { CvService } from '../services/cv.service';
import { RainbowDirective } from 'src/app/directives/rainbow.directive';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RainbowDirective],
})
export class AutocompleteComponent {
  formBuilder = inject(FormBuilder);
  cvService = inject(CvService);
  get search(): AbstractControl {
    return this.form.get('search')!;
  }
  form = this.formBuilder.group({ search: [''] });
}
