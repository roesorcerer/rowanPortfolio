import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { SecurityContext } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';  // Assume you have a FooterComponent
import { HomePageComponent } from './pages/home-page/home-page.component';  // Assume you have a HomeComponent
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { PortfolioPageComponent } from './pages/portfolio-page/portfolio-page.component';
import { BlogPageComponent } from './pages/blog-page/blog-page.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';  // Assume you have an AboutComponent
import { Post1Component } from './pages/blog-page/posts/post1.component';
import { CarouselComponent } from './pages/portfolio-page/carousel/carousel.component';
import { MarketingComponent } from './pages/portfolio-page/marketing/marketing.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'portfolio', component: PortfolioPageComponent },
  { path: 'blog', component: BlogPageComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'blog/:id', component: Post1Component},
  { path: 'portfolio/:id', component: CarouselComponent},
  { path: 'portfolio/:id', component: MarketingComponent},
  { path: '', redirectTo: '/blog', pathMatch: 'full' },  // Redirect to blog as the default route
  { path: '**', redirectTo: '/blog' }  // Redirect any unknown paths to blog

  // Add more routes as needed
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    AboutPageComponent,
    ContactPageComponent,
    PortfolioPageComponent,
    BlogPageComponent,
    ServicesPageComponent,
    Post1Component,
    CarouselComponent,
    MarketingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),  // Configure routes
    MarkdownModule.forRoot({ sanitize: SecurityContext.NONE }),  // Configure markdown
    MarkdownModule.forChild()  // Configure markdown
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
