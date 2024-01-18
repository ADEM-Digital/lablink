"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
// import app, { server } from "../server";
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../utils/server"));
dotenv_1.default.config();
const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const app = (0, server_1.default)();
let userProfileMongoId = "";
describe("/v1/userProfiles endpoint", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (connectionString) {
            yield mongoose_1.default.connect(connectionString);
            console.log("Connected to MongoDB for testing");
        }
    }));
    describe("get request", () => {
        it("should return a 200 status and an array of user profiles", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get("/v1/userProfiles").expect(200);
            // expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            res.body.forEach((profile) => {
                expect(profile).toHaveProperty("userId");
                expect(typeof profile.userId).toBe("string");
                expect(profile).toHaveProperty("name");
                expect(typeof profile.name).toBe("string");
                expect(profile).toHaveProperty("governmentId");
                expect(typeof profile.governmentId).toBe("string");
                // Optional fields
                if (profile.hasOwnProperty("phone")) {
                    expect(typeof profile.phone).toBe("string");
                }
                if (profile.hasOwnProperty("address")) {
                    expect(typeof profile.address).toBe("string");
                }
            });
        }));
        it("should handle errors correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.connection.close();
            const res = yield (0, supertest_1.default)(app).get("/v1/userProfiles");
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual("Failed to fetch user profiles");
            if (connectionString) {
                yield mongoose_1.default.connect(connectionString);
            }
        }));
    });
    describe("post request", () => {
        it("should return a 201 status and a user profile object", () => __awaiter(void 0, void 0, void 0, function* () {
            const newUserProfile = {
                userId: new mongoose_1.default.Types.ObjectId().toString(),
                name: "John Doe",
                governmentId: new mongoose_1.default.Types.ObjectId().toString(),
                phone: "123-456-7890",
                address: "123 Main St",
            };
            const res = yield (0, supertest_1.default)(app)
                .post("/v1/userProfiles")
                .send(newUserProfile)
                .expect(201);
            userProfileMongoId = res.body._id;
            expect(res.body).toHaveProperty("userId", newUserProfile.userId);
            expect(res.body).toHaveProperty("name", newUserProfile.name);
            expect(res.body).toHaveProperty("governmentId", newUserProfile.governmentId);
        }));
        it("should handle errors correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/v1/userProfiles").expect(500);
            expect(res.body).toEqual("Failed to create user profile");
        }));
    });
    describe("put request", () => {
        it("should return a 200 status and a MongoDB update summary object", () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedUserProfile = {
                userId: new mongoose_1.default.Types.ObjectId().toString(),
                name: "John Doe",
                governmentId: "659f6a77870ab60f0f77e8ce",
                phone: "123-456-7890",
                address: "123 Main St",
            };
            const res = yield (0, supertest_1.default)(app)
                .put(`/v1/userProfiles/${userProfileMongoId}`)
                .send(updatedUserProfile)
                .expect(200);
            expect(res.body).toHaveProperty("acknowledged", true);
            expect(res.body).toHaveProperty("modifiedCount", 1);
            expect(res.body).toHaveProperty("matchedCount", 1);
        }));
        it("should handle errors correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put(`/v1/userProfiles/${userProfileMongoId}`)
                .expect(500);
            expect(res.body).toEqual("Failed to update user profile");
        }));
    });
    describe("delete request", () => {
        it("should return a 200 status and a MongoDB delete result object", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete(`/v1/userProfiles/${userProfileMongoId}`)
                .expect(200);
            expect(res.body).toHaveProperty("acknowledged", true);
            expect(res.body).toHaveProperty("deletedCount", 1);
        }));
        it("should handle errors correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.connection.close();
            const res = yield (0, supertest_1.default)(app).post("/v1/userProfiles").expect(500);
            expect(res.body).toEqual("Failed to create user profile");
        }));
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Close the server
        // server.close();
        // Close the database connection, if applicable
        yield mongoose_1.default.connection.close();
    }));
});
