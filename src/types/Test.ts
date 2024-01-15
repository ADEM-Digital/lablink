import { ObjectId } from "mongodb"

export type Test = {
    _id: ObjectId;
    name: String;
    description: String;
    resultTime: String;
}