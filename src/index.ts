import * as bodyParser from "body-parser";
import * as express from "express";
import * as OAuthServer from "express-oauth-server";
import model from "./models/mongodb-model";
import handleError from "./handlers/error-handler";
import logger from "./utils/logger";

const app = express();

const oauthServer = new OAuthServer({
	model: model,
	useErrorHandler: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/v1/authorize", oauthServer.authorize());
app.use("/api/v1/authenticate", oauthServer.authenticate());
app.use("/api/v1/token", oauthServer.token());
app.use(handleError);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	logger.info(`Listening on ${port}`);
});
