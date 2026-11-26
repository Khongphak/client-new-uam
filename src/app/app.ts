import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HttpErrorDialogs } from './core/api/http-error-dialogs';
import { UToast } from './shared/ui/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpErrorDialogs, UToast],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
