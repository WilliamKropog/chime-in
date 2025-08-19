import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-news-column',
    templateUrl: './news-column.component.html',
    styleUrl: './news-column.component.css',
    standalone: false
})
export class NewsColumnComponent implements OnInit {

  gifUrls: string[] = [
    'https://media.tenor.com/4NKYe36DcE8AAAAi/taclan-world.gif',
    'https://media1.tenor.com/m/mhqpG8re2cEAAAAd/soe-salome.gif',
    'https://media1.tenor.com/m/ftwl9XdoLTEAAAAd/hello-old-people.gif',
    'https://media.tenor.com/SM7_EzknnNYAAAAi/coffee-emoji.gif',
    'https://media.tenor.com/sFdzKK1cHcsAAAAi/astronaut-tumble-astronaut.gif',
    'https://media.tenor.com/hgkeO1pyvfQAAAAi/american-flag-america.gif',
    'https://media1.tenor.com/m/drKuhgBblzcAAAAd/anton-hacker.gif',
    'https://media.tenor.com/FQzTJNbnBtkAAAAi/goodmorning-sunrise.gif',
    'https://media1.tenor.com/m/9CkkuOW5428AAAAC/monday-typing-monkey.gif'
  ];
  
  selectedGifUrl: string | undefined;

  ngOnInit(): void {
    this.selectRandomGif();
  }

  selectRandomGif(): void {
    const randomIndex = Math.floor(Math.random() * this.gifUrls.length);
    this.selectedGifUrl = this.gifUrls[randomIndex];
  }

}
