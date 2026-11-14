/**
 * The only two intentional deviations from the legacy payload (decided by the user, 2026-11-11;
 * contract section 2.2 and appendix H). Everything else in the fixtures must stay byte-for-byte
 * what the legacy app sent. Both are UNVERIFIED against a real backend.
 */
export const intentionalDeviations = [
  {
    id: 'DEV-1-add-system-token-times',
    fixture: 'add-system.request',
    summary:
      'add-system sends accessTokenTime and refreshTokenTime (legacy did not). NOT yet verified that the backend accepts them; if it rejects or drops them, hide the fields in the Add form and remove them from this fixture.',
  },
  {
    id: 'DEV-2-trim-names',
    fixture:
      'add-system.request, update-system.request, add-menu-screen.request, update-menu-screen.request, add-role.request, update-role.request',
    summary:
      'systemName, menu screenName and roleName are trimmed before sending (legacy did not). description, url and username are NOT trimmed. Fixture names therefore carry no leading/trailing whitespace; client tests must feed padded input and expect the trimmed fixture.',
  },
] as const;

/** Surrounds a name with whitespace, to feed a client under test that must trim it (DEV-2). */
export function padded(name: string): string {
  return `  ${name}\t `;
}
