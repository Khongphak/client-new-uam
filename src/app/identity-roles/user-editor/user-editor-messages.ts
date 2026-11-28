/** Texts of the Edit user errors (artboards EditAdMissing / EditDuplicate / EditInvalid). Typed catalog, one place. */
export const USER_EDITOR_MESSAGES = {
  /** MSG_INVALID_USER_AD: the AD answer has no data for a required profile field. */
  adIncomplete:
    'The user information retrieved from Active Directory is incomplete. Please update the required details in Active Directory before processing with user registration.',
  /** MSG_INVALID_DUPLICATED_SYSTEM */
  duplicateSystem: 'Duplicate system detected. Please check and select a different system.',
  /** MSG_REQUIRED */
  requiredTitle: 'Some required information is missing, please correct and try again.',
  /** Title of the summary when the problem is not a missing value (duplicate system, 422). */
  invalidTitle: 'Invalid input',
  selectSystem: 'Select a system.',
  selectRole: 'Select a role.',
  selectSystemAndRole: 'Select a system and a role.',
  /** Placeholder of a profile field that AD did not give. */
  missingInAd: 'Missing in AD',
} as const;
