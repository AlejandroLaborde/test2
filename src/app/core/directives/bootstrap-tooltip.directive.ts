import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Directive({
  selector: '[appBootstrapTooltip]',
  standalone: true
})
export class BootstrapTooltipDirective {
  @Input() tooltipTitle: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.el.nativeElement.setAttribute('title', this.tooltipTitle);
    this.el.nativeElement.setAttribute('data-bs-toggle', 'tooltip');
    this.el.nativeElement.setAttribute('data-bs-placement', 'right');
    new bootstrap.Tooltip(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    const tooltipInstance = bootstrap.Tooltip.getInstance(this.el.nativeElement);
    if (tooltipInstance) {
      tooltipInstance.dispose();
    }
  }
}
