import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: String,
	password: String,
	scope: String,
});

export default mongoose.model("User", UserSchema);
