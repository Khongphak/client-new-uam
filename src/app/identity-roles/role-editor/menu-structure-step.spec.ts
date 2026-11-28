import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { IconItem, MenuScreenBySystemItem } from '../../shared/interfaces';
import { MasterDataApi } from '../../system-catalog/api/master-data-api';
import { MenuScreenApi } from '../../system-catalog/api/menu-screen-api';
import { MenuStructureStep } from './menu-structure-step';
import { RoleEditorStore } from './role-editor-store';

const menu = (id: number) =>
  ({ id, screenName: `Menu ${id}`, functional: '[view,add]', imageId: 100 + id }) as MenuScreenBySystemItem;
const icon = (id: number, category: string) => ({ id, category, name: `Icon ${id}`, data: 'PHN2Zy8+' }) as IconItem;

async function render() {
  const getBySystemId = vi.fn(() => of([1, 2, 3, 4].map(menu)));
  TestBed.configureTestingModule({
    providers: [
      RoleEditorStore,
      { provide: MenuScreenApi, useValue: { getBySystemId } },
      { provide: MasterDataApi, useValue: { getIcons: () => of([icon(7, 'Menu'), icon(8, 'Menu'), icon(9, 'Systems')]) } },
    ],
  });
  const store = TestBed.inject(RoleEditorStore);
  store.patchInfo({ systemId: 's1' });
  const fixture = TestBed.createComponent(MenuStructureStep);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const q = (id: string) => el.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  const all = (id: string) => Array.from(el.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[];
  const click = async (target: HTMLElement | null) => {
    target!.click();
    await fixture.whenStable();
  };
  const addTo = async (menuId: number, place: string) => {
    const select = q(`pool-${menuId}`)!.querySelector('select') as HTMLSelectElement;
    select.value = place;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };
  const rowNames = () => Array.from(el.querySelectorAll('.tr .tr-name')).map((n) => n.textContent?.trim());
  const open = async (key: string) => click(q(`opts-${key}`));
  const popItem = (text: string) =>
    Array.from(el.querySelectorAll('.pop button')).find((b) => b.textContent?.trim() === text) as HTMLElement | undefined;
  
  return { fixture, el, q, all, click, addTo, rowNames, open, popItem, store, getBySystemId };
}

describe('MenuStructureStep (UAM-ROL-02)', () => {
  it('loads the menus of the chosen system and starts with an empty structure', async () => {
    const { q, getBySystemId } = await render();
    expect(getBySystemId).toHaveBeenCalledWith('s1');
    expect(q('tree-empty')).toBeTruthy();
    expect(q('pool-text')!.textContent).toContain('4 of 4 not used yet');
  });

  describe('a menu is used once (TC-ROL-002)', () => {
    it('adding a menu takes it off the list; removing it brings it back', async () => {
      const { q, addTo, click, open, popItem, rowNames } = await render();
      await addTo(1, 'root');
      expect(rowNames()).toEqual(['Menu 1']);
      expect(q('pool-1')).toBeNull();
      expect(q('pool-text')!.textContent).toContain('3 of 4');

      await open('m1');
      await click(popItem('Remove from role')!);
      expect(rowNames()).toEqual([]);
      expect(q('pool-1')).toBeTruthy();
    });

    it('says so when every menu is placed, and filters the list by search', async () => {
      const { q, addTo, fixture } = await render();
      const search = q('pool-search') as HTMLInputElement;
      search.value = 'menu 3';
      search.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(q('pool-1')).toBeNull();
      expect(q('pool-3')).toBeTruthy();
      search.value = '';
      search.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      for (const id of [1, 2, 3, 4]) await addTo(id, 'root');
      expect(q('pool-none')!.textContent).toContain('All 4 menus are placed');
    });
  });

  describe('groups nest at most 2 levels, with an icon (TC-ROL-003)', () => {
    it('adds a group, then a sub group; a sub group has no "Add sub group"', async () => {
      const { q, click, open, rowNames, popItem } = await render();
      await click(q('add-group'));
      expect(rowNames()).toEqual(['New group']);
      await open('g1');
      await click(q('add-sub'));
      expect(rowNames()).toEqual(['New group', 'New sub group']);
      await open('g2');
      expect(q('add-sub')).toBeNull();
      expect(popItem('Rename or change icon')).toBeTruthy();
    });

    it('picks the group icon from the Menu icons of the app (not the Systems ones) and stores it', async () => {
      const { q, el, click, store } = await render();
      await click(q('add-group'));
      const options = Array.from(el.querySelectorAll('.icongrid .ic-opt')) as HTMLElement[];
      expect(options.map((o) => o.getAttribute('aria-label'))).toEqual(['Icon 7', 'Icon 8']);
      expect(store.structure().groups['g1'].imageGroupId).toBe(7);
      await click(options[1]);
      expect(store.structure().groups['g1'].imageGroupId).toBe(8);
      expect(options[1].getAttribute('aria-checked')).toBe('true');
    });

    it('renames a group', async () => {
      const { q, el, click, fixture, rowNames } = await render();
      await click(q('add-group'));
      const input = el.querySelector('[data-testid="group-edit"] input') as HTMLInputElement;
      input.value = 'Claims';
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(rowNames()).toEqual(['Claims']);
    });

    it('deleting a group asks first, then returns its menus to the list', async () => {
      const { q, click, addTo, open, popItem, rowNames } = await render();
      await click(q('add-group'));
      await addTo(2, 'g1');
      expect(q('pool-2')).toBeNull();
      await open('g1');
      await click(popItem('Delete group')!);
      expect(q('group-delete')!.textContent).toContain('Its 1 menus go back to the list');
      expect(rowNames()).toEqual(['New group', 'Menu 2']);
      await click(q('confirm-delete'));
      expect(rowNames()).toEqual([]);
      expect(q('pool-2')).toBeTruthy();
    });
  });

  describe('move without dragging (TC-ROL-004)', () => {
    it('Move up / Move down change the order; the ends are disabled', async () => {
      const { addTo, open, click, popItem, rowNames } = await render();
      await addTo(1, 'root');
      await addTo(2, 'root');
      await open('m1');
      expect((popItem('Move up') as HTMLButtonElement).disabled).toBe(true);
      await click(popItem('Move down')!);
      expect(rowNames()).toEqual(['Menu 2', 'Menu 1']);
    });

    it('⋯ → Move to… puts a menu in a group, or back at the top level', async () => {
      const { q, click, addTo, open, all, rowNames, popItem } = await render();
      await click(q('add-group'));
      await addTo(1, 'root');
      await open('m1');
      expect(all('move-to').map((b) => b.textContent?.trim())).toEqual(['New group']);
      await click(all('move-to')[0]);
      expect(rowNames()).toEqual(['New group', 'Menu 1']);
      expect(q('row-m1')!.style.paddingLeft).toBe('40px');

      await open('m1');
      expect(all('move-to').map((b) => b.textContent?.trim())).toEqual(['Top level']);
      expect(popItem('Move up')).toBeTruthy();
      await click(all('move-to')[0]);
      expect(rowNames()).toEqual(['New group', 'Menu 1']);
      expect(q('row-m1')!.style.paddingLeft).toBe('12px');
    });

    it('a menu can be added from the list straight into a group, and tells screen readers', async () => {
      const { q, click, addTo, el } = await render();
      await click(q('add-group'));
      await addTo(3, 'g1');
      expect(q('row-m3')).toBeTruthy();
      expect(el.querySelector('[role="status"]')!.textContent).toContain('Added Menu 3 to New group');
    });

    it('Escape closes the options menu', async () => {
      const { open, el, fixture, addTo } = await render();
      await addTo(1, 'root');
      await open('m1');
      expect(el.querySelector('.pop')).toBeTruthy();
      el.querySelector('.more')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(el.querySelector('.pop')).toBeNull();
    });

    it('drag: dropping a pool menu on the top-level end zone, and a row inside a group', async () => {
      const { q, click, all, fixture, rowNames } = await render();
      const drag = async (from: HTMLElement, to: HTMLElement) => {
        from.dispatchEvent(new Event('dragstart', { bubbles: true }));
        to.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
        to.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
        await fixture.whenStable();
      };
      await click(q('add-group'));
      await drag(q('pool-2')!, q('end-zone')!);
      expect(rowNames()).toEqual(['New group', 'Menu 2']);
      // jsdom has no layout, so a drop counts as the bottom half: a group takes it inside
      await drag(q('pool-1')!, q('row-g1')!);
      expect(all('row-m1').length).toBe(1);
      expect(rowNames()).toEqual(['New group', 'Menu 1', 'Menu 2']);
    });
  });

  it('changing the system on step 1 empties the structure (menus belong to a system)', async () => {
    const { addTo, store, fixture, rowNames } = await render();
    await addTo(1, 'root');
    store.patchInfo({ systemId: 's2' });
    await fixture.whenStable();
    expect(rowNames()).toEqual([]);
  });
});
