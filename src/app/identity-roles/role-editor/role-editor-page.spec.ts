import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SystemRecord } from '../../shared/interfaces';
import { SystemApi } from '../../system-catalog/api/system-api';
import { RoleEditorPage } from './role-editor-page';

const system = (systemId: string, systemName: string) => ({ systemId, systemName }) as SystemRecord;

async function render() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: SystemApi, useValue: { getAll: () => of([system('s1', ' Claim System '), system('s2', 'Policy')]) } },
    ],
  });
  const fixture = TestBed.createComponent(RoleEditorPage);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const q = <T extends HTMLElement>(id: string) => el.querySelector(`[data-testid="${id}"]`) as T | null;
  const settle = () => fixture.whenStable();
  const type = async (id: string, value: string) => {
    const input = q<HTMLInputElement>(id)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await settle();
  };
  const pickSystem = async (value: string) => {
    const select = q<HTMLSelectElement>('role-system')!;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    await settle();
  };
  const click = async (id: string) => {
    q(id)!.click();
    await settle();
  };
  return { el, q, settle, type, pickSystem, click };
}

describe('RoleEditorPage (UAM-ROL-01 / TC-ROL-001)', () => {
  it('shows 3 steps (progress bar for phone) starting on Role info', async () => {
    const { el, q } = await render();
    const steps = Array.from(el.querySelectorAll('.p-steps-item-label')).map((e) => e.textContent?.trim());
    expect(steps).toEqual(['Role info', 'Menus & groups', 'Permissions']);
    expect(q('progress')!.textContent).toContain('Step 1 of 3');
    expect(q('step-info')).toBeTruthy();
    expect(q('cancel')).toBeTruthy();
    expect(q('back')).toBeNull();
  });

  it('lists the systems with trimmed names', async () => {
    const { el } = await render();
    const options = Array.from(el.querySelectorAll('#role-system option')).map((o) => o.textContent?.trim());
    expect(options).toEqual(['Select a system', 'Claim System', 'Policy']);
  });

  it('stays on step 1 with errors when required fields are empty', async () => {
    const { q, click } = await render();
    await click('next');
    expect(q('step-info')).toBeTruthy();
    expect(q('err-system')!.textContent).toContain('Select a system');
    expect(q('err-name')!.textContent).toContain('Enter a role name');
    expect(q<HTMLInputElement>('role-name')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('goes to step 2 when filled, and Back keeps the data', async () => {
    const { q, type, pickSystem, click } = await render();
    await pickSystem('s1');
    await type('role-name', 'Claim Officer');
    await type('role-description', 'Register claims');
    await click('next');
    expect(q('step-menus')).toBeTruthy();
    expect(q('progress')!.textContent).toContain('Step 2 of 3');
    await click('back');
    expect(q<HTMLSelectElement>('role-system')!.value).toBe('s1');
    expect(q<HTMLInputElement>('role-name')!.value).toBe('Claim Officer');
    expect(q<HTMLTextAreaElement>('role-description')!.value).toBe('Register claims');
  });

  it('reaches Permissions and has no Next there', async () => {
    const { q, type, pickSystem, click } = await render();
    await pickSystem('s1');
    await type('role-name', 'A');
    await click('next');
    await click('next');
    expect(q('step-permissions')).toBeTruthy();
    expect(q('next')).toBeNull();
  });

  it('clicking a later step in the bar does not skip an invalid Role info', async () => {
    const { el, q, settle } = await render();
    (el.querySelectorAll('.p-steps-item-link')[2] as HTMLElement).click();
    await settle();
    expect(q('step-info')).toBeTruthy();
    expect(q('err-name')).toBeTruthy(); // the click did reach the store and was refused
  });
});
