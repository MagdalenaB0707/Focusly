import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  homeOutline,
  libraryOutline,
  flashOutline,
  timeOutline,
  trophyOutline,
  folderOpenOutline,
  addOutline,
  chevronForwardOutline,
  bookOutline,
} from 'ionicons/icons';

addIcons({
  'home-outline': homeOutline,
  'library-outline': libraryOutline,
  'flash-outline': flashOutline,
  'time-outline': timeOutline,         
  'trophy-outline': trophyOutline,
  'folder-open-outline': folderOpenOutline,
  'add-outline': addOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'book-outline': bookOutline,         

});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});
