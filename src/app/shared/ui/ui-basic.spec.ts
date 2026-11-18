import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  UBack,
  UChip,
  UChips,
  UCount,
  UNum,
  URole,
  URow,
  USectionTitle,
  UStatus,
  USubtitle,
  USwitchRow,
  UTile,
} from './index';

@Component({
  imports: [
    UBack,
    UChip,
    UChips,
    UCount,
    UNum,
    URole,
    URow,
    USectionTitle,
    UStatus,
    USubtitle,
    USwitchRow,
    UTile,
  ],
  template: `
    <u-status data-testid="on" [active]="true" />
    <u-status data-testid="off" [active]="false" />
    <u-status data-testid="custom" [active]="true" label="Enabled" />
    <u-role data-testid="role">ADMIN</u-role>
    <u-num data-testid="num">42</u-num>
    <u-section-title data-testid="section">Role information</u-section-title>
    <u-subtitle data-testid="sub">Approvers</u-subtitle>
    <u-count data-testid="count" [value]="3" />
    <u-tile data-testid="tile-icon" icon="pi-folder-open" size="sm" [off]="true" />
    <u-tile data-testid="tile-slot"><b>X</b></u-tile>
    <u-chips data-testid="chips">
      <u-chip data-testid="chip-on">View</u-chip>
      <u-chip data-testid="chip-off" [off]="true">Delete</u-chip>
    </u-chips>
    <a uRow data-testid="row-link" href="/x">link</a>
    <div uRow data-testid="row-stack" layout="stack">stack</div>
    <div uRow data-testid="row-cols" layout="cols" cols="1fr 2fr">cols</div>
    <u-switch-row data-testid="sw" label="Active" hint="Can log in" [(checked)]="active" />
    <u-back data-testid="back" link="/users" fragment="roles" />
  `,
})
class Host {
  readonly active = signal(false);
}

describe('shared/ui basic components', () => {
  let el: HTMLElement;
  let host: Host;
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;
  const q = (id: string) => el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('status shows a dot plus text, never a chip', () => {
    expect(q('on').textContent).toContain('Active');
    expect(q('on').classList).toContain('is-ok');
    expect(q('on').querySelector('.dot')).not.toBeNull();
    expect(q('off').textContent).toContain('Inactive');
    expect(q('off').classList).not.toContain('is-ok');
    expect(q('custom').textContent).toContain('Enabled');
    expect(q('on').querySelector('.p-tag, .p-chip')).toBeNull();
  });

  it('projects text for role, num, section title, subtitle', () => {
    expect(q('role').textContent).toBe('ADMIN');
    expect(q('num').textContent).toBe('42');
    expect(q('section').textContent).toBe('Role information');
    expect(q('sub').textContent).toBe('Approvers');
  });

  it('count renders its value', () => {
    expect(q('count').textContent?.trim()).toBe('3');
  });

  it('tile renders a PrimeIcon (decorative) or projected content', () => {
    const t = q('tile-icon');
    expect(t.querySelector('i.pi.pi-folder-open')?.getAttribute('aria-hidden')).toBe('true');
    expect(t.classList).toContain('is-sm');
    expect(t.classList).toContain('is-off');
    expect(t.getAttribute('aria-hidden')).toBe('true');
    expect(q('tile-slot').textContent).toBe('X');
  });

  it('chip marks not-granted ones as off', () => {
    expect(q('chip-on').classList).not.toContain('is-off');
    expect(q('chip-off').classList).toContain('is-off');
    expect(q('chips').children.length).toBe(2);
  });

  it('row stays a real element and takes its layout', () => {
    expect(q('row-link').tagName).toBe('A');
    expect(q('row-stack').classList).toContain('is-stack');
    expect(q('row-cols').classList).toContain('is-cols');
    expect(q('row-cols').style.getPropertyValue('--cols')).toBe('1fr 2fr');
  });

  it('switch row toggles from the label and writes back to the model', async () => {
    const input = q('sw').querySelector<HTMLInputElement>('input[role="switch"], input')!;
    expect(input.checked).toBe(false);
    expect(q('sw').textContent).toContain('Can log in');

    q('sw').querySelector<HTMLElement>('label')!.click();
    await fixture.whenStable();
    expect(host.active()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it('back is a labelled link that keeps the tab fragment', () => {
    const a = q('back').querySelector('a')!;
    expect(a.getAttribute('aria-label')).toBe('Back');
    expect(a.getAttribute('href')).toBe('/users#roles');
  });
});
