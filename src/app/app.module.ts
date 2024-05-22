import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';  // Assume you have a FooterComponent
import { HomePageComponent } from './pages/home-page/home-page.component';  // Assume you have a HomeComponent
import { AboutPageComponent } from './pages/about-page/about-page.component';  // Assume you have an AboutComponent

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'about', component: AboutPageComponent },
  // Add more routes as needed
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    AboutPageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)  // Configure routes
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
