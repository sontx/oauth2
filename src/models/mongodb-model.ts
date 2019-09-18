import * as mongoose from "mongoose";
import logger from "../utils/logger";
import { deleteNullOrUndefied } from "../utils/utils";
import { Client, Code, GetAccessToken, GetAuthorizationCode, GetClient, GetRefreshToken, GetUser, GetUserFromClient, OAuth2Model, RevokeAuthorizationCode, RevokeToken, SaveAuthorizationCode, SaveToken, Token, UserObject, ValidateScope, VerifyScope } from "./model";
import connect from "./mongodb";

const { OAuthAccessToken, OAuthAuthorizationCode, OAuthClient, OAuthRefreshToken, OAuthScope, User } = connect(
	process.env.MONGODB_URI,
	err => {
		if (err) {
			logger.error(err);
		} else {
			logger.info("Connected to mongodb server");
		}
	},
);

interface MongoDbDocument extends mongoose.Document {
	[x: string]: any;
}

const VALID_SCOPES = ["read", "write"];

class OAuth2ModalMongoDb implements OAuth2Model {
	private static getClientObject(doc: MongoDbDocument): Client {
		return doc && doc.OAuthClient && { ...doc.OAuthClient._doc, id: `${doc.OAuthClient._id}` };
	}

	private static getUserObject(doc: MongoDbDocument): UserObject {
		return doc && doc.User && { ...doc.User._doc, id: `${doc.User._id}` };
	}

	async getAccessToken(bearerToken: string): Promise<GetAccessToken | null> {
		logger.verbose(`getAccessToken: bearerToken[${bearerToken}]`);
		const found: MongoDbDocument = await OAuthAccessToken.findOne({ access_token: bearerToken })
			.populate("User")
			.populate("OAuthClient")
			.exec();
		return (
			found && {
				accessToken: found.accessToken,
				accessTokenExpiresAt: found.expires,
				scope: found.scope,
				client: OAuth2ModalMongoDb.getClientObject(found),
				user: OAuth2ModalMongoDb.getUserObject(found),
			}
		);
	}

	async getClient(clientId: string, clientSecret: string): Promise<GetClient | null> {
		logger.verbose(`getClient: clientId[${clientId}], clientSecret[${clientSecret}]`);

		const found: MongoDbDocument = await OAuthClient.findOne(
			deleteNullOrUndefied({ _id: clientId, client_secret: clientSecret }),
		).exec();

		return (
			found && {
				id: clientId,
				grants: found.grants || [],
				redirectUris: [found.redirect_uri],
			}
		);
	}

	async getUser(username: string, password: string): Promise<GetUser | null> {
		logger.verbose(`getUser: username[${username}], password[${password}]`);

		const found: any = await User.findOne({ username, password });
		return found;
	}

	async revokeAuthorizationCode(codeObject: GetAuthorizationCode): Promise<RevokeAuthorizationCode> {
		logger.verbose(`revokeAuthorizationCode: codeObject[${codeObject.code}]`);
		const found = await OAuthAuthorizationCode.findOneAndDelete({
			authorization_code: codeObject.code,
		}).exec();
		return !!found;
	}

	async getAuthorizationCode(authorizationCode: string): Promise<GetAuthorizationCode | null> {
		logger.verbose(`getAuthorizationCode: authorizationCode[${authorizationCode}]`);
		const found: MongoDbDocument = await OAuthAuthorizationCode.findOne({ authorization_code: authorizationCode })
			.populate("User")
			.populate("OAuthClient")
			.exec();
		return (
			found && {
				code: authorizationCode,
				expiresAt: found.expires,
				redirectUri: found.OAuthClient.redirect_uri,
				client: OAuth2ModalMongoDb.getClientObject(found),
				user: OAuth2ModalMongoDb.getUserObject(found),
				scope: found.scope,
			}
		);
	}

	async revokeToken(token: GetRefreshToken): Promise<RevokeToken> {
		logger.verbose(`revokeToken: token[${token.refreshToken}]`);
		const found = await OAuthRefreshToken.findOneAndDelete({
			refresh_token: token.refreshToken,
		}).exec();
		return !!found;
	}

	async getRefreshToken(refreshToken: string): Promise<GetRefreshToken> {
		logger.verbose(`getRefreshToken: refreshToken[${refreshToken}]`);
		const found: MongoDbDocument = await OAuthRefreshToken.findOne({ refresh_token: refreshToken })
			.populate("User")
			.populate("OAuthClient")
			.exec();
		return (
			found && {
				client: OAuth2ModalMongoDb.getClientObject(found),
				user: OAuth2ModalMongoDb.getUserObject(found),
				refreshTokenExpiresAt: found.expires,
				refreshToken: refreshToken,
				scope: found.scope,
			}
		);
	}

	async saveToken(token: Token, client: Client, user: UserObject): Promise<SaveToken> {
		logger.verbose(`saveToken: token[${token.accessToken}], client[${client.id}], user[${user.id}]`);
		await Promise.all(
			[
				OAuthAccessToken.create({
					access_token: token.accessToken,
					expires: token.accessTokenExpiresAt,
					OAuthClient: client.id,
					User: user.id,
					scope: token.scope,
				}),
				token.refreshToken &&
					OAuthRefreshToken.create({
						refresh_token: token.refreshToken,
						expires: token.refreshTokenExpiresAt,
						OAuthClient: client.id,
						User: user.id,
						scope: token.scope,
					}),
			].filter(Boolean),
		);
		return {
			...token,
			client,
			user,
		};
	}

	async saveAuthorizationCode(code: Code, client: Client, user: UserObject): Promise<SaveAuthorizationCode> {
		logger.verbose(`saveAuthorizationCode: code[${code.authorizationCode}], client[${client.id}], user[${user.id}]`);
		await OAuthAuthorizationCode.create({
			expires: code.expiresAt,
			OAuthClient: client.id,
			authorization_code: code.authorizationCode,
			User: user.id,
			scope: code.scope,
		});
		return code;
	}

	async getUserFromClient(client: Client): Promise<GetUserFromClient> {
		logger.verbose(`getUserFromClient: client[${client.id}]`);

		const found: MongoDbDocument = await OAuthClient.findOne(deleteNullOrUndefied({ ...client, _id: client.id }))
			.populate("User")
			.exec();
		return found && found.User;
	}

	validateScope(user: UserObject, client: Client, scope: string): Promise<ValidateScope> {
		logger.verbose(`validateScope: user[${user.id}], client[${client.id}], scope[${scope}]`);
		return new Promise(resolve =>
			resolve((scope || "").split(" ").filter(s => VALID_SCOPES.indexOf(s.trim()) >= 0).length > 0),
		);
	}

	verifyScope(accessToken: Token, scope: string): Promise<VerifyScope> {
		logger.verbose(`verifyScope: accessToken[${accessToken.accessToken}], scope[${scope}]`);
		return new Promise(resolve => resolve(accessToken.scope === scope));
	}
}

export default new OAuth2ModalMongoDb();
