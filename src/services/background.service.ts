import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  private renderer: Renderer2 | undefined;
  private currentIndex = 0;
  private images = [
    'assets/images/chimeinbackground1.jpeg',
    'assets/images/chimeinbackground2.jpg',
    'assets/images/chimeinbackground3.jpeg',
    'assets/images/chimeinbackground6.jpg'
  ];

  constructor( rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initBackgroundChanger(element: HTMLElement){
    const changeBackground = () => {
      this.renderer?.setStyle(element, 'backgroundImage', `url(${this.images[this.currentIndex]})`);
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    };

    changeBackground();
    setInterval(changeBackground, 15000);
  }

}
