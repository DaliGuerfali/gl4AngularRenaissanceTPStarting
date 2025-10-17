import { Component } from '@angular/core';
import { RainbowDirective } from 'src/app/directives/rainbow.directive';

@Component({
  selector: 'app-card-profil',
  templateUrl: './card-profil.component.html',
  styleUrls: ['./card-profil.component.css'],
})
export class CardProfilComponent {
  name = 'sellaouti';
  firstname = 'aymen';
  job = 'teacher';
  path = 'rotating_card_profile.png';
}
