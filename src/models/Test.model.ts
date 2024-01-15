import mongoose, { Schema } from "mongoose";


export const testSchema = new Schema({
  name: {type: String, unique: true},
  description: String,
  resultTIme: String,
});

export const Test = mongoose.model("tests", testSchema, "tests");