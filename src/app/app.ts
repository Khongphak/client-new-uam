import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HttpErrorDialogs } from './core/api/http-error-dialogs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpErrorDialogs],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
