// Synthetic list data for production-build runs (page.route). Fields follow src/app/shared/interfaces/**.
const own = ['Test Owner', 'Owner Two', 'Owner Three'];
const types = ['Web Application', 'Mobile Application', 'API'];
export const systems = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1, createdDate: '2025-01-15T13:30:50.06', systemId: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  systemName: `System ${String.fromCharCode(65 + (i % 26))}${i + 1}`, type: types[i % 3], description: 'x', imageId: i + 1,
  url: 'https://s.example.test/', authenrizationType: 'JWT', ownerName: own[i % 3], accessTokenTime: 30, refreshTokenTime: 60,
  status: i % 4 === 3 ? 'Inactive' : 'Active', createdBy: 'System', updatedDate: `2025-0${1 + (i % 9)}-1${i % 9}T10:00:00`, updatedBy: 'Tester', icon: i % 2 ? 'PHN2Zy8+' : null,
}));
const fns = ['[add,view,edit]', '[view]', '[add,view,edit,delete,export]', '[]'];
export const menus = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, systemId: systems[i % 3].systemId, systemName: systems[i % 3].systemName, screenName: `Menu ${i + 1}`, url: '/m', functional: fns[i % 4],
  description: null, imageId: 1, status: i % 5 === 4 ? 'Inactive' : 'Active', createdDate: '2025-01-01T00:00:00', createdBy: 'S', updatedDate: '2025-03-04T10:00:00', updatedBy: 'Tester', image: null,
}));
export const s2s = [1, 2, 3].map((i) => ({ id: i, sourceSystemName: systems[i - 1].systemName, targetSystemName: systems[i].systemName, status: i === 3 ? 'Inactive' : 'Active', updatedDate: '2025-04-05T10:00:00', updatedBy: 'Tester', mode: 'x' }));
export const roles = Array.from({ length: 12 }, (_, i) => ({
  id: 100 + i, systemId: systems[i % 3].systemId, roleName: `Role ${i + 1}`, status: i % 4 === 3 ? 'Inactive' : 'Active', description: 'Desc', createdDate: '2025-01-16T15:17:14.63',
  createdBy: 'System', updatedDate: '2025-02-11T10:59:30.85', updatedBy: 'Tester', systemName: systems[i % 3].systemName,
}));
export const uamRoles = ['ADMIN', 'DEVELOPER', 'AUDIT', 'USER'].map((name, i) => ({ id: i + 1, name, status: 'Active', description: name, createdDate: '2025-01-01T00:00:00', createdBy: 'S', updatedDate: '2025-01-01T00:00:00', updatedBy: 'S' }));
const deps = ['IT Center', 'Claims', 'Underwriting'];
export const users = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1, username: `user${i + 1}`, fullname: `First${i + 1} Last${i + 1}`, firstname: `First${i + 1}`, lastname: `Last${i + 1}`, email: `user${i + 1}@example.test`,
  department: deps[i % 3], position: 'P', phoneNo: i % 2 ? '1234' : null, isSuperAdmin: false, status: i % 3 === 2 ? 'Inactive' : 'Active', uamRoleId: (i % 4) + 1,
  createdDate: '2025-01-13T00:00:00', createdBy: 'admin', updatedDate: '2025-01-30T07:16:30.263', updatedBy: 'Tester', roleName: null, uamRole: '',
}));
