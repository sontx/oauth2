export type GrantType = "authorization_code" | "client_credentials" | "implicit" | "refresh_token" | "password";
export type Client = { id: string };
export type UserObject = { id: string };

export type GetClient = {
	id: string;
	redirectUris: string[];
	grants: GrantType[];
};
export type GetAccessToken = {
	accessToken: string;
	accessTokenExpiresAt: Date;
	scope: string;
	client: Client;
	user: UserObject;
};
export type GetUser = { username: string; password: string; scope: string };
export type RevokeAuthorizationCode = boolean;
export type GetAuthorizationCode = {
	code: string;
	expiresAt: Date;
	redirectUri: string;
	scope: string;
	client: Client;
	user: UserObject;
};
export type RevokeToken = boolean;
export type GetRefreshToken = {
	refreshToken: string;
	refreshTokenExpiresAt?: Date;
	scope?: string;
	client: Client;
	user: UserObject;
};
export type Token = {
	accessToken: string;
	accessTokenExpiresAt: Date;
	refreshToken?: string;
	refreshTokenExpiresAt?: Date;
	scope?: string;
	client: Client;
	user: UserObject;
};
export type SaveToken = Token;

export type Code = {
	authorizationCode: string;
	expiresAt: Date;
	redirectUri: string;
	scope?: string;
};

export type SaveAuthorizationCode = Code;

export type GetUserFromClient = UserObject;
export type ValidateScope = boolean;
export type VerifyScope = boolean;
export type GenerateAccessToken = string;
export type GenerateRefreshToken = string;
export type GenerateAuthorizationCode = string;

export interface OAuth2Model {
	getAccessToken(token: string): Promise<GetAccessToken | null>;
	getClient(clientId: string, clientSecret: string): Promise<GetClient | null>;
	getUser(username: string, password: string): Promise<GetUser | null>;
	revokeAuthorizationCode(codeObject: GetAuthorizationCode): Promise<RevokeAuthorizationCode>;
	getAuthorizationCode(authorizationCode: string): Promise<GetAuthorizationCode | null>;
	revokeToken(token: GetRefreshToken): Promise<RevokeToken>;
	getRefreshToken(refreshToken: string): Promise<GetRefreshToken>;
	saveToken(token: Token, client: Client, user: UserObject): Promise<SaveToken>;
	saveAuthorizationCode(code: Code, client: Client, user: UserObject): Promise<SaveAuthorizationCode>;
	getUserFromClient(client: Client): Promise<GetUserFromClient>;
	validateScope(user: UserObject, client: Client, scope: string): Promise<ValidateScope>;
	verifyScope(accessToken: Token, scope: string): Promise<VerifyScope>;
	generateAccessToken?(client: Client, user: UserObject, scope: string): Promise<GenerateAccessToken>;
	generateRefreshToken?(client: Client, user: UserObject, scope: string): Promise<GenerateRefreshToken>;
	generateAuthorizationCode?(client: Client, user: UserObject, scope: string): Promise<GenerateAuthorizationCode>;
}
