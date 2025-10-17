import {
  Directive,
  HostBinding,
  HostListener,
  signal,
  effect,
} from '@angular/core';

@Directive({
  selector: 'input[rainbow], textarea[rainbow]',
  standalone: true,
})
export class RainbowDirective {
  // Colors array for rainbow effect
  private colors: string[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
  ];

  // Signal for current color
  private currentColor = signal<string>('black');

  // Host bindings using signal-derived values
  @HostBinding('style.color')
  get textColor(): string {
    return this.currentColor();
  }

  @HostBinding('style.borderColor')
  get borderColor(): string {
    return this.currentColor();
  }

  // Change color on keyup
  @HostListener('keyup')
  onKeyUp(): void {
    requestAnimationFrame(() => {
      const randomIndex = Math.floor(Math.random() * this.colors.length);
      const newColor = this.colors[randomIndex];
      this.currentColor.set(newColor);
    });
  }

  constructor() {}
}
