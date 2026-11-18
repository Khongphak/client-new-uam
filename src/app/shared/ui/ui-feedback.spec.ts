import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UDialog, UDialogDetail } from './dialog';
import { UErrPage } from './errpage';
import { USkel } from './skeleton';
import { UState } from './state';
import { UToast, UToastService } from './toast';

@Component({
  imports: [UDialog, UErrPage, USkel, UState, UToast],
  template: `
    <u-skel data-testid="skel" width="55%" height="2rem" />
    <u-state data-testid="loading" kind="loading" label="Loading users" [rows]="2" />
    <u-state data-testid="empty" kind="empty" heading="No users" message="Add one to start.">
      <button uStateActions data-testid="empty-btn">Add user</button>
    </u-state>
    <u-state
      data-testid="error"
      kind="error"
      heading="Could not load"
      message="Try again."
      code="Error 50001"
    />
    <u-errpage data-testid="err" code="404" heading="Lost" message="No such page.">
      <a uErrpageActions href="/home" data-testid="err-link">Back to Home</a>
    </u-errpage>
    <u-dialog
      [(visible)]="open"
      kind="error"
      heading="Server error"
      message="Something failed."
      [detail]="detail()"
    >
      <button uDialogActions data-testid="dlg-close" (click)="open.set(false)">Close</button>
    </u-dialog>
    <u-toast />
  `,
})
class Host {
  readonly open = signal(false);
  readonly detail = signal<UDialogDetail | null>({ label: 'Code', value: '50001' });
}

describe('shared/ui feedback components', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;
  let host: Host;
  const q = (id: string) => (document.body.querySelector(`[data-testid="${id}"]`) as HTMLElement)!;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('skeleton is decorative and takes size inputs', () => {
    expect(q('skel').getAttribute('aria-hidden')).toBe('true');
    expect(q('skel').style.getPropertyValue('--u-skel-w')).toBe('55%');
  });

  it('loading state is a labelled status region with skeleton rows', () => {
    const region = q('loading').querySelector('[role="status"]')!;
    expect(region.getAttribute('aria-label')).toBe('Loading users');
    expect(region.querySelectorAll('.row').length).toBe(2);
  });

  it('empty and error states show caller-supplied text, code and actions', () => {
    expect(q('empty').textContent).toContain('No users');
    expect(q('empty').textContent).toContain('Add one to start.');
    expect(q('empty').querySelector('.pi-folder-open')).not.toBeNull();
    expect(q('empty-btn')).not.toBeNull();
    expect(q('error').querySelector('.pi-exclamation-triangle')).not.toBeNull();
    expect(q('error').textContent).toContain('Error 50001');
  });

  it('error page has a code, an h1 and projected actions', () => {
    expect(q('err-link')).not.toBeNull();
    expect(q('err').querySelector('h1')?.textContent).toContain('Lost');
    expect(q('err').querySelector('[data-testid="u-errpage-code"]')?.textContent).toBe('404');
  });

  it('dialog stays closed until visible, then shows one structure with detail and actions', async () => {
    expect(q('u-dialog-heading')).toBeNull();

    host.open.set(true);
    await fixture.whenStable();

    expect(q('u-dialog-heading').textContent).toContain('Server error');
    expect(q('u-dialog-message').textContent).toContain('Something failed.');
    expect(q('u-dialog-detail').textContent).toContain('50001');
    expect(q('dlg-close')).not.toBeNull();
    const dialog = document.body.querySelector('div[role="alertdialog"]')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(q('u-dialog-heading').id);

    host.detail.set(null);
    await fixture.whenStable();
    expect(q('u-dialog-detail')).toBeNull();
  });

  it('dialog closes from its action button', async () => {
    host.open.set(true);
    await fixture.whenStable();
    q('dlg-close').click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('toast service shows messages through <u-toast>', async () => {
    TestBed.inject(UToastService).error('Save failed', 'Try again');
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 10));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Save failed');
  });
});
