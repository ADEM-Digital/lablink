import { ObjectId } from "mongodb"
import { UserProfile } from "./UserProfile"
import { Test } from "./Test";

export type ServiceType = {
    _id: ObjectId;
    user: { type: ObjectId | UserProfile, ref: UserProfile, required: true};
    status: "pending results" | "results uploaded" | "opened";
    tests: Test[];
    results?: String;
    createdAt: Date;
    updatedAt: Date;
}