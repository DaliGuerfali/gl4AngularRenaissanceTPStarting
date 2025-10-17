import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { HighlightDirective } from '../highlight.directive';
import { RainbowDirective } from '../rainbow.directive';

@Component({
  selector: 'app-ngclass',
  templateUrl: './ngclass.component.html',
  styleUrls: ['./ngclass.component.css'],
  standalone: true,
  imports: [NgClass, HighlightDirective, RainbowDirective],
})
export class NgclassComponent {
  isAllume = false;
  interrupteur() {
    this.isAllume = !this.isAllume;
  }
}
