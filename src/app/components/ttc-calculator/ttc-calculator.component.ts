import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ttc-calculator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ttc-calculator.component.html',
  styleUrl: './ttc-calculator.component.css'
})
export class TtcCalculatorComponent {
  quantity = signal(1);     
  price = signal(0);         
  vat = signal(18);          

  discount = computed(() => {
    const qty = this.quantity();
    if (qty >= 15) return 30;      
    if (qty >= 10) return 20;      
    return 0;                       
  });

  totalTTC = computed(() => {
    const qty = this.quantity();
    const p = this.price();
    const vatRate = this.vat();
    const discountRate = this.discount();

    const subtotal = qty * p;

    const afterDiscount = subtotal * (1 - discountRate / 100);

    const total = afterDiscount * (1 + vatRate / 100);

    return total.toFixed(2);
  });

  pricePerUnitTTC = computed(() => {
    const p = this.price();
    const vatRate = this.vat();
    const unitPrice = p * (1 + vatRate / 100);
    return unitPrice.toFixed(2);
  });

  discountAmount = computed(() => {
    const qty = this.quantity();
    const p = this.price();
    const discountRate = this.discount();
    
    const subtotal = qty * p;
    const discount = subtotal * (discountRate / 100);
    
    return discount.toFixed(2);
  });
}