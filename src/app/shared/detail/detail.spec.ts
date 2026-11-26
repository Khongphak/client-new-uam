import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  UAccordion,
  UApprovers,
  UFacts,
  UGroupHead,
  UMetaIco,
  UPermRow,
  UStats,
  USysCard,
  USysGrid,
  countMenuStats,
  type FactItem,
} from './index';
import type { RoleMenuItem } from '../interfaces';

const node = (over: Partial<RoleMenuItem>): RoleMenuItem => ({
  roleId: 1,
  roleMenuId: 1,
  menuId: null,
  parentId: 0,
  groupName: null,
  screenName: null,
  sortOrder: 0,
  permission: null,
  imageGroupId: 0,
  groupMenus: [],
  ...over,
});

describe('countMenuStats (derived from the loaded menu tree, front-end only)', () => {
  it('counts menus, groups (any depth) and top-level nodes', () => {
    const tree = [
      node({ roleMenuId: 1, groupName: 'A', groupMenus: [node({ roleMenuId: 2, menuId: 10, screenName: 'm1', parentId: 1 }), node({ roleMenuId: 3, menuId: 11, screenName: 'm2', parentId: 1 })] }),
      node({ roleMenuId: 4, groupName: 'B', groupMenus: [node({ roleMenuId: 5, groupName: 'B1', parentId: 4, groupMenus: [node({ roleMenuId: 6, menuId: 12, parentId: 5 })] })] }),
      node({ roleMenuId: 7, menuId: 13, screenName: 'top' }),
    ];
    expect(countMenuStats(tree)).toEqual({ menus: 4, groups: 3, topLevel: 3 });
  });

  it('is all zero for an empty tree', () => {
    expect(countMenuStats([])).toEqual({ menus: 0, groups: 0, topLevel: 0 });
  });
});

const facts: FactItem[] = [
  { icon: 'pi-user', label: 'Username', value: 'nattaya.p' },
  { icon: 'pi-phone', label: 'Extension number', value: null },
  { icon: 'pi-envelope', label: 'Email', value: '  ' },
];

@Component({
  imports: [UFacts, UStats, UApprovers, UMetaIco, UAccordion, UGroupHead, UPermRow, USysGrid, USysCard],
  template: `
    <u-facts data-testid="facts" [items]="facts" />
    <u-facts data-testid="facts-cols" [items]="facts" cols />
    <u-facts data-testid="facts-prose" [items]="facts" prose />
    <u-stats
      data-testid="stats"
      label="Role size"
      [items]="[
        { value: 6, label: 'Menus' },
        { value: 3, label: 'Groups' },
        { value: 2, label: 'Top level' },
      ]"
    />
    <u-approvers data-testid="appr" [names]="['Somchai', 'Wichai']" />
    <u-approvers data-testid="appr-none" [names]="[]" />
    <u-approvers data-testid="appr-over" [names]="['a', 'b', 'c', 'd']" />
    <u-meta-ico data-testid="meta" icon="pi-server">Claim System</u-meta-ico>
    <u-accordion data-testid="acc" title="Claim System" subtitle="Role: Admin · 2 menus" icon="pi-server" [open]="true">
      <p data-testid="acc-body">body</p>
    </u-accordion>
    <u-accordion data-testid="acc-closed" title="Other" />
    <u-group-head data-testid="gh" title="Setup / Users" hint="2 menus" icon="pi-folder-open" />
    <u-perm-row data-testid="pr" name="Users" group="Setup" [functional]="['add', 'view', 'edit']" />
    <u-perm-row data-testid="pr-flush" name="Roles" flush [functional]="['add', 'view']" [granted]="['view']" />
    <u-sys-grid data-testid="grid">
      <a uSysCard data-testid="card" href="https://x.test" name="Claim" description="Claims" owner="Ops" type="Web" icon="pi-folder" external></a>
      <div uSysCard data-testid="card-off" name="Old" disabled></div>
    </u-sys-grid>
  `,
})
class Host {
  readonly facts = facts;
}

describe('shared/detail components', () => {
  let el: HTMLElement;
  const q = (id: string) => el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

  beforeEach(async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('facts: one li per item with icon, label and value; empty values show an em dash', () => {
    const lis = q('facts').querySelectorAll('li');
    expect(lis.length).toBe(3);
    expect(lis[0].querySelector('i.pi.pi-user')?.getAttribute('aria-hidden')).toBe('true');
    expect(lis[0].querySelector('.u-facts__k')?.textContent).toBe('Username');
    expect(lis[0].querySelector('.u-facts__v')?.textContent).toBe('nattaya.p');
    expect(lis[1].querySelector('.u-facts__v')?.textContent).toBe('—');
    expect(lis[2].querySelector('.u-facts__v')?.textContent).toBe('—');
  });

  it('facts: cols and prose are modifiers', () => {
    expect(q('facts').classList).not.toContain('is-cols');
    expect(q('facts-cols').classList).toContain('is-cols');
    expect(q('facts-prose').classList).toContain('is-prose');
  });

  it('stats: a labelled group of value + caption', () => {
    const s = q('stats');
    expect(s.getAttribute('role')).toBe('group');
    expect(s.getAttribute('aria-label')).toBe('Role size');
    expect(Array.from(s.querySelectorAll('b')).map((b) => b.textContent)).toEqual(['6', '3', '2']);
    expect(Array.from(s.querySelectorAll('span')).map((b) => b.textContent)).toEqual(['Menus', 'Groups', 'Top level']);
  });

  it('approvers: always three numbered slots, names only, unset ones say "Not set"', () => {
    const lis = q('appr').querySelectorAll('li');
    expect(lis.length).toBe(3);
    expect(lis[0].textContent).toContain('Somchai');
    expect(lis[1].textContent).toContain('Wichai');
    expect(lis[2].classList).toContain('is-empty');
    expect(lis[2].textContent).toContain('Not set');
    expect(q('appr').tagName).toBe('U-APPROVERS');
    expect(q('appr').querySelector('ol')?.getAttribute('aria-label')).toBe('Approvers');
    expect(q('appr-none').querySelectorAll('li.is-empty').length).toBe(3);
    expect(q('appr-over').querySelectorAll('li').length).toBe(3);
    expect(q('appr-over').textContent).not.toContain('d');
  });

  it('meta-ico: decorative icon + text', () => {
    expect(q('meta').querySelector('i.pi-server')?.getAttribute('aria-hidden')).toBe('true');
    expect(q('meta').textContent).toContain('Claim System');
  });

  it('accordion: native details/summary, open by input, projects body', () => {
    const d = q('acc').querySelector('details')!;
    expect(d.open).toBe(true);
    expect(d.querySelector('summary')?.textContent).toContain('Claim System');
    expect(d.querySelector('summary')?.textContent).toContain('Role: Admin · 2 menus');
    expect(q('acc-body').textContent).toBe('body');
    expect(q('acc-closed').querySelector('details')!.open).toBe(false);
  });

  it('group head: icon tile, title, hint', () => {
    expect(q('gh').textContent).toContain('Setup / Users');
    expect(q('gh').textContent).toContain('2 menus');
    expect(q('gh').querySelector('i.pi-folder-open')).not.toBeNull();
  });

  it('perm row: group prefix, name and one chip per function', () => {
    expect(q('pr').textContent).toContain('Setup /');
    expect(q('pr').textContent).toContain('Users');
    const chips = q('pr').querySelectorAll('u-chip');
    expect(Array.from(chips).map((c) => c.textContent)).toEqual(['add', 'view', 'edit']);
    expect(Array.from(chips).some((c) => c.classList.contains('is-off'))).toBe(false);
  });

  it('perm row: with `granted`, the rest are struck-through chips with an accessible name', () => {
    expect(q('pr-flush').classList).toContain('is-flush');
    const [add, view] = Array.from(q('pr-flush').querySelectorAll('u-chip'));
    expect(add.classList).toContain('is-off');
    expect(add.getAttribute('aria-label')).toBe('add, not granted');
    expect(view.classList).not.toContain('is-off');
    expect(view.getAttribute('aria-label')).toBeNull();
  });

  it('system card: a real link opens in a new tab with a name; disabled one is a plain block', () => {
    const a = q('card');
    expect(a.tagName).toBe('A');
    expect(a.querySelector('i.pi-folder')).not.toBeNull();
    expect(a.textContent).toContain('Claim');
    expect(a.textContent).toContain('Claims');
    expect(a.textContent).toContain('Ops');
    expect(a.textContent).toContain('Web');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
    expect(a.getAttribute('aria-label')).toBe('Open Claim in a new tab');
    expect(a.querySelector('i.pi-external-link')).not.toBeNull();
    const off = q('card-off');
    expect(off.tagName).toBe('DIV');
    expect(off.classList).toContain('is-disabled');
    expect(off.getAttribute('target')).toBeNull();
    expect(q('grid').querySelectorAll('[uSysCard]').length).toBe(2);
  });
});
