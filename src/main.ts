import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module'; // Updated import statement


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));