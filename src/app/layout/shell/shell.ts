import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { SignOut } from '../../access/sign-out';
import { buildShellMenu } from './shell-menu';
import { SHELL_PROFILE } from './shell-profile';

/** Sidebar becomes a drawer below this width (design spec: 768px). */
const PHONE_QUERY = '(max-width: 767.98px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Shell {
  private readonly router = inject(Router);
  private readonly profile = inject(SHELL_PROFILE);
  private readonly signOut = inject(SignOut);

  protected readonly isPhone = toSignal(
    inject(BreakpointObserver)
      .observe(PHONE_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** Sidebar visibility: open on desktop, closed drawer on phone; resets when the breakpoint flips. */
  protected readonly sidebarOpen = linkedSignal(() => !this.isPhone());
  protected readonly userMenuOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly settingOpen = linkedSignal(() => this.url().startsWith('/setting'));

  protected readonly user = computed(() => {
    const p = this.profile();
    return p ? { name: p.firstName, role: p.systemAdmin ? 'System Admin' : p.uamRole } : null;
  });

  protected readonly menu = computed(() => {
    const p = this.profile();
    return p ? buildShellMenu(p.uamRole, p.systemAdmin) : [];
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected toggleSetting(): void {
    this.settingOpen.update((v) => !v);
  }

  protected toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.update((v) => !v);
  }

  /** On phone the drawer covers the page, so choosing a destination closes it. */
  protected onNavigate(): void {
    if (this.isPhone()) this.sidebarOpen.set(false);
    this.userMenuOpen.set(false);
  }

  protected logout(): void {
    this.onNavigate();
    this.signOut.run().subscribe();
  }

  protected onEscape(): void {
    this.userMenuOpen.set(false);
    if (this.isPhone()) this.sidebarOpen.set(false);
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (this.userMenuOpen() && !target?.closest('[data-user-menu]')) this.userMenuOpen.set(false);
  }
}
