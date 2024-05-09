import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { HeaderComponent } from './partials/header/header.component'; 
import { FooterComponent } from './partials/footer/footer.component'; 

@NgModule({
  declarations: [AppComponent, LayoutComponent, HomePageComponent, HeaderComponent, FooterComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}