import * as mongoose from "mongoose";
import { MongoError } from "mongodb";

import OAuthAccessToken from "./OAuthAccessToken";
import OAuthAuthorizationCode from "./OAuthAuthorizationCode";
import OAuthClient from "./OAuthClient";
import OAuthRefreshToken from "./OAuthRefreshToken";
import OAuthScope from "./OAuthScope";
import User from "./User";

export default function connect(connectionString: string, done?: (err?: MongoError) => void) {
  mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: false }, done);
  return  {
    OAuthAccessToken,
    OAuthAuthorizationCode,
    OAuthClient,
    OAuthRefreshToken,
    OAuthScope,
    User,
  };
}
