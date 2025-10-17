import {
  Directive,
  OnInit,
  OnDestroy,
  HostBinding,
  ElementRef,
} from '@angular/core';
import { debounce, debounceTime } from 'rxjs';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Subscription } from 'rxjs/internal/Subscription';

@Directive({
  selector: 'input[rainbow], textarea[rainbow]',
  standalone: true,
})
export class RainbowDirective implements OnInit, OnDestroy {
  private colors: string[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
  ];
  @HostBinding('style.color') color: string = 'black';
  @HostBinding('style.borderColor') boarderColor: string = 'black';
  private keyupSubscription: Subscription | undefined;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.keyupSubscription = fromEvent(this.elementRef.nativeElement, 'keyup')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.changeColors();
      });
  }

  ngOnDestroy(): void {
    this.keyupSubscription?.unsubscribe();
  }

  private changeColors(): void {
    requestAnimationFrame(() => {
      const randomIndex = Math.floor(Math.random() * this.colors.length);
      this.color = this.colors[randomIndex];
      this.boarderColor = this.colors[randomIndex];
    });
  }
}
