// Golden fixtures (synthetic, follow the API contract; NOT yet verified against real backend responses — TODO(source)).
// Keyed by file name without `.json`. See README.md.

import adSearchRequest from './ad-search.request.json';
import adSearchResponse from './ad-search.response.json';
import addConsentAcceptRequest from './add-consent-accept.request.json';
import addMenuScreenRequest from './add-menu-screen.request.json';
import addRoleRequest from './add-role.request.json';
import addSystemToSystemRequest from './add-system-to-system.request.json';
import addSystemRequest from './add-system.request.json';
import addUserRequest from './add-user.request.json';
import auditTrailsReportRequest from './audit-trails-report.request.json';
import consentLastVersionResponse from './consent-last-version.response.json';
import envelopeAlreadyExisted from './envelope-already-existed.json';
import envelopeSuccess from './envelope-success.json';
import generalDataFunctionResponse from './general-data-function.response.json';
import getAllRolesResponse from './get-all-roles.response.json';
import getAllSystemsResponse from './get-all-systems.response.json';
import getAllUsersResponse from './get-all-users.response.json';
import getRoleMenuByRoleIdResponse from './get-role-menu-by-role-id.response.json';
import getUserByIdResponse from './get-user-by-id.response.json';
import loginRequest from './login.request.json';
import loginResponse from './login.response.json';
import menuScreensBySystemIdResponse from './menu-screens-by-system-id.response.json';
import updateMenuScreenRequest from './update-menu-screen.request.json';
import updateRoleRequest from './update-role.request.json';
import updateSystemToSystemRequest from './update-system-to-system.request.json';
import updateSystemRequest from './update-system.request.json';
import updateUserRequest from './update-user.request.json';

export const fixtures = {
  'ad-search.request': adSearchRequest,
  'ad-search.response': adSearchResponse,
  'add-consent-accept.request': addConsentAcceptRequest,
  'add-menu-screen.request': addMenuScreenRequest,
  'add-role.request': addRoleRequest,
  'add-system-to-system.request': addSystemToSystemRequest,
  'add-system.request': addSystemRequest,
  'add-user.request': addUserRequest,
  'audit-trails-report.request': auditTrailsReportRequest,
  'consent-last-version.response': consentLastVersionResponse,
  'envelope-already-existed': envelopeAlreadyExisted,
  'envelope-success': envelopeSuccess,
  'general-data-function.response': generalDataFunctionResponse,
  'get-all-roles.response': getAllRolesResponse,
  'get-all-systems.response': getAllSystemsResponse,
  'get-all-users.response': getAllUsersResponse,
  'get-role-menu-by-role-id.response': getRoleMenuByRoleIdResponse,
  'get-user-by-id.response': getUserByIdResponse,
  'login.request': loginRequest,
  'login.response': loginResponse,
  'menu-screens-by-system-id.response': menuScreensBySystemIdResponse,
  'update-menu-screen.request': updateMenuScreenRequest,
  'update-role.request': updateRoleRequest,
  'update-system-to-system.request': updateSystemToSystemRequest,
  'update-system.request': updateSystemRequest,
  'update-user.request': updateUserRequest,
} as const;

export type FixtureName = keyof typeof fixtures;
