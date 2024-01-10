import mongoose, { Schema } from "mongoose";
import { UserProfile } from "./UserProfile.model";
import { Test } from "./Test.model";

export const serviceSchema = new Schema({
  user: UserProfile,
  createdAt: Date,
  updatedAt: Date,
  status: {
    type: String,
    enum: ["pending results", "results uploaded", "opened"],
    default: "pending results"
  },
  tests: [Test],
  results: String
});

export const Service = mongoose.model("services", serviceSchema, "services");