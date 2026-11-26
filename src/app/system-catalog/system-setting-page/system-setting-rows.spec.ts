import { MenuScreenRecord, SystemRecord, SystemToSystemListItem } from '../../shared/interfaces';
import {
  formatUpdated,
  functionSummary,
  menuRow,
  s2sRow,
  systemRow,
  tabFromFragment,
  TABS,
} from './system-setting-rows';

const system = (over: Partial<SystemRecord> = {}): SystemRecord =>
  ({
    id: 1,
    systemId: 'SYS-001',
    systemName: 'Claim System',
    type: 'Web',
    ownerName: 'Claims Dept.',
    status: 'ACTIVE',
    updatedDate: '2026-10-28T09:30:00',
    updatedBy: 'somchai.k',
    icon: 'PHN2Zy8+',
    ...over,
  }) as SystemRecord;

describe('system setting rows', () => {
  it('maps a system: name, id, owner, type, case-insensitive status, icon', () => {
    const row = systemRow(system());
    expect(row).toMatchObject({
      key: '1',
      name: 'Claim System',
      code: 'SYS-001',
      cells: ['Claims Dept.', 'Web'],
      active: true,
      updated: '28 Oct 2026',
    });
    expect(row.icon).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(systemRow(system({ status: 'inactive', icon: null }))).toMatchObject({
      active: false,
      icon: null,
    });
  });

  it('maps a menu with a functions summary', () => {
    const menu = {
      id: 7,
      systemName: 'Claim System',
      screenName: 'Claim Register',
      functional: '[view,add,edit,delete]',
      status: 'Active',
      updatedDate: '2026-10-28T00:00:00',
      image: null,
    } as MenuScreenRecord;
    expect(menuRow(menu)).toMatchObject({
      key: '7',
      name: 'Claim Register',
      cells: ['Claim System', 'view, add, edit +1'],
    });
  });

  it('maps system-to-system without any field the list does not carry', () => {
    const item = {
      id: 3,
      sourceSystemName: 'Claim System',
      targetSystemName: 'Policy Admin',
      status: 'Inactive',
      updatedDate: null,
      updatedBy: null,
    } as SystemToSystemListItem;
    expect(s2sRow(item)).toMatchObject({
      key: '3',
      name: 'Claim System',
      code: null,
      cells: ['Policy Admin'],
      active: false,
      updated: '–',
    });
  });

  it('summarises functions: empty, up to three, and the rest as +n', () => {
    expect(functionSummary('[]')).toBe('–');
    expect(functionSummary(null)).toBe('–');
    expect(functionSummary('[view,add]')).toBe('view, add');
    expect(functionSummary('[a,b,c,d,e]')).toBe('a, b, c +2');
  });

  it('formats dates and tolerates bad input', () => {
    expect(formatUpdated('2026-01-05T23:59:59')).toBe('05 Jan 2026');
    expect(formatUpdated('not a date')).toBe('–');
    expect(formatUpdated(undefined)).toBe('–');
  });

  it('resolves the tab from the URL fragment, defaulting to System', () => {
    expect(tabFromFragment('menu').id).toBe('menu');
    expect(tabFromFragment('system-to-system').id).toBe('system-to-system');
    expect(tabFromFragment('system-setup').id).toBe('system');
    expect(tabFromFragment(null).id).toBe('system');
    expect(TABS.map((t) => t.label)).toEqual(['System', 'Menu', 'System to System']);
  });
});
