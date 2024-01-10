import mongoose, { Schema } from "mongoose";


export const testSchema = new Schema({
  name: String,
  description: String
});

export const Test = mongoose.model("tests", testSchema, "tests");