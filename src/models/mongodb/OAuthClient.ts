import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const OAuthClientSchema = new Schema({
	name: String,
	client_secret: String,
	redirect_uri: String,
	grants: Array,
	scope: String,
	User: { type: Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("OAuthClient", OAuthClientSchema);
