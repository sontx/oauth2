import * as express from "express";
import * as UnauthorizedRequestError from "oauth2-server/lib/errors/unauthorized-request-error";

export default function handleError(
	err: Error & { code?: number },
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
): any {
	res.status(err.code || 400);
	if (err instanceof UnauthorizedRequestError) {
		return res.send();
	}
	res.send({ error: err.name, error_description: err.message });
}
