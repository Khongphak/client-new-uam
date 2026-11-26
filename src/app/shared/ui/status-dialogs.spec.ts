import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ApiError } from '../../core/api/api-error';
import { UInactiveConfirm, UInactiveFail, inactiveFailDetail } from './status-dialogs';

@Component({
  imports: [UInactiveConfirm, UInactiveFail],
  template: `
    <u-inactive-confirm [(visible)]="confirmOpen" [name]="name()" (confirmed)="confirmed = confirmed + 1" />
    <u-inactive-fail
      [(visible)]="failOpen"
      [error]="error()"
      (retry)="retried = retried + 1"
    />
  `,
})
class Host {
  readonly confirmOpen = signal(false);
  readonly failOpen = signal(false);
  readonly name = signal<string | undefined>('IT TICKET');
  readonly error = signal<ApiError>({ kind: 'server', code: '50001', message: 'DB is busy' });
  confirmed = 0;
  retried = 0;
}

describe('status dialogs (UAM-ERR-04)', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;
  let host: Host;
  const q = (id: string) => document.body.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });
  afterEach(async () => {
    // Close first: an open p-dialog owns overlay/animation timers that keep the test worker alive.
    host.confirmOpen.set(false);
    host.failOpen.set(false);
    await fixture.whenStable();
    fixture.destroy();
  });

  it('confirm dialog names the record and keeps both buttons', async () => {
    host.confirmOpen.set(true);
    await fixture.whenStable();
    expect(q('u-dialog-heading')!.textContent).toContain('Set “IT TICKET” to Inactive?');
    expect(q('u-dialog-message')!.textContent).toContain(
      'Roles and users won’t be able to use it. You can set it back to Active later.',
    );
    expect(q('inactive-cancel')).not.toBeNull();
    expect(q('inactive-confirm')!.textContent).toContain('Set to Inactive');
  });

  it('confirm dialog falls back to a generic heading without a name', async () => {
    host.name.set(undefined);
    host.confirmOpen.set(true);
    await fixture.whenStable();
    expect(q('u-dialog-heading')!.textContent).toContain('Set this record to Inactive?');
  });

  it('confirm emits once and closes; cancel closes without emitting', async () => {
    host.confirmOpen.set(true);
    await fixture.whenStable();
    q('inactive-confirm')!.querySelector<HTMLElement>('button')!.click();
    await fixture.whenStable();
    expect(host.confirmed).toBe(1);
    expect(host.confirmOpen()).toBe(false);

    host.confirmOpen.set(true);
    await fixture.whenStable();
    q('inactive-cancel')!.querySelector<HTMLElement>('button')!.click();
    await fixture.whenStable();
    expect(host.confirmed).toBe(1);
    expect(host.confirmOpen()).toBe(false);
  });

  it('fail dialog shows the server message verbatim, not sample text', async () => {
    host.failOpen.set(true);
    await fixture.whenStable();
    expect(q('u-dialog-heading')!.textContent).toContain('Couldn’t change the status');
    expect(q('u-dialog-detail')!.textContent).toContain('DB is busy');
  });

  it('fail dialog retry emits and closes; close just closes', async () => {
    host.failOpen.set(true);
    await fixture.whenStable();
    q('inactive-retry')!.querySelector<HTMLElement>('button')!.click();
    await fixture.whenStable();
    expect(host.retried).toBe(1);
    expect(host.failOpen()).toBe(false);

    host.failOpen.set(true);
    await fixture.whenStable();
    q('inactive-close')!.querySelector<HTMLElement>('button')!.click();
    await fixture.whenStable();
    expect(host.retried).toBe(1);
    expect(host.failOpen()).toBe(false);
  });
});

describe('inactiveFailDetail', () => {
  it('uses the server message when present', () => {
    expect(inactiveFailDetail({ kind: 'server', code: '50001', message: 'DB' })).toEqual({
      label: 'Message',
      value: 'DB',
    });
  });
  it('falls back to the result code when the server sent no message', () => {
    expect(inactiveFailDetail({ kind: 'server', code: '50002', message: null })).toEqual({
      label: 'Code',
      value: '50002',
    });
  });
  it('is null when there is nothing from the server to show', () => {
    expect(inactiveFailDetail({ kind: 'network' })).toBeNull();
    expect(inactiveFailDetail({ kind: 'not-found', message: null })).toBeNull();
  });
});
