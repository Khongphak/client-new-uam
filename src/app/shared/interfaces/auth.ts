// v1/auth/* — spec section 2. Request keys start with a capital letter, as the backend expects.

export interface LoginRequest {
  readonly Username: string;
  readonly Password: string;
  readonly SystemId: string;
}

export interface UserProfile {
  readonly userId: number;
  readonly userName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly position: string;
  /** UAM role name used to choose menus, e.g. `ADMIN`. */
  readonly uamRole: string;
  readonly systemAdmin: boolean;
  readonly userType: string;
}

export interface LoginResult {
  readonly sessionId: string;
  /** `false` → the user must accept the PDPA consent first. */
  readonly isConsent: boolean;
  readonly userProfile: UserProfile;
}

/** `data` of the login envelope. The envelope also carries `messageType`. */
export interface LoginData {
  readonly result: LoginResult;
}

export interface RefreshTokenRequest {
  readonly SystemId: string;
}

/** The app does not read this body; success (HTTP 2xx) is all that matters. Not wrapped in the envelope. */
export interface RefreshTokenResponse {
  readonly isValid: boolean;
  readonly userName: string;
  readonly userType: string;
}

export interface LogoutRequest {
  readonly Username: string;
  readonly ClientId: string;
}
