import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const OAuthScopeSchema = new Schema({
	scope: String,
	is_default: Boolean,
});

export default mongoose.model("OAuthScope", OAuthScopeSchema);
