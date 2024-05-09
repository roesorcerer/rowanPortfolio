import { Component } from '@angular/core';
import { HomePageComponent } from './home-page/home-page.component';
import { HeaderComponent } from './partials/header/header.component'; 
import { FooterComponent } from './partials/footer/footer.component'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../../src/assets/css/style.css'],
  providers: [HomePageComponent, HeaderComponent, FooterComponent]
})
export class AppComponent {
  title = 'RowanBlog';
}