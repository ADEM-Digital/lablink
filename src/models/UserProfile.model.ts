import mongoose, { Schema } from "mongoose";

export const userProfileSchema = new Schema({
  userId: {type: String, require: true, unique: true},
  name: {type: String, require: true},
  governmentId: {type: String, require: true},
  phone: String,
  address: String,
});

export const UserProfile = mongoose.model("userProfiles", userProfileSchema, "userProfiles");