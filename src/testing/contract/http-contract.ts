import { HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { FixtureName, fixtures } from '../fixtures';
import { assertJsonMatches } from './json-diff';

export interface ContractRequestSpec {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path (and query) exactly as the client sends it, without `baseUrl`, e.g. `v1/Roles/get-role?roleId=1`. */
  readonly url: string;
  /** Prefix the client adds in front of `url` (API base URL), if any. */
  readonly baseUrl?: string;
  /** Golden request body. Omit for requests that must carry no body (GET). */
  readonly fixture?: FixtureName;
}

/**
 * Finds the one pending request with this method + URL and asserts its body equals the golden
 * fixture: same keys, same key case, same value types and values. Returns the request so the
 * test can flush a response. Throws (failing the test) on any difference.
 *
 * The matched request is removed from the controller, as with `expectOne`.
 */
export function expectContractRequest(
  ctrl: HttpTestingController,
  spec: ContractRequestSpec,
): TestRequest {
  const fullUrl = `${spec.baseUrl ?? ''}${spec.url}`;
  const label = `${spec.method} ${fullUrl}`;

  const matches = ctrl.match((r) => r.method === spec.method && r.urlWithParams === fullUrl);
  if (matches.length === 0) {
    throw new Error(
      `No request matched ${label} (check the HTTP method and the exact URL path/query).`,
    );
  }
  if (matches.length > 1) {
    throw new Error(`${matches.length} requests matched ${label}; expected exactly one.`);
  }

  const req = matches[0];
  if (spec.fixture === undefined) {
    if (req.request.body !== null && req.request.body !== undefined) {
      throw new Error(`${label}: no body expected, but the request carries one.`);
    }
  } else {
    assertJsonMatches(fixtures[spec.fixture], req.request.body, `${label} body (${spec.fixture})`);
  }
  return req;
}

/** Answers a request with a copy of a golden response fixture (the golden object stays untouched). */
export function flushFixture(req: TestRequest, name: FixtureName): void {
  req.flush(structuredClone(fixtures[name]));
}
