import { Directive, ElementRef, OnInit, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Configuramos el observador
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Cuando entra a la pantalla, le agregamos la clase 'visible'
          this.renderer.addClass(this.el.nativeElement, 'visible');
          // Dejamos de observarlo para que la animación ocurra solo la primera vez
          this.observer.unobserve(this.el.nativeElement); 
        }
      });
    }, { 
      threshold: 0.2 // Se activa cuando el 20% del elemento es visible
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}