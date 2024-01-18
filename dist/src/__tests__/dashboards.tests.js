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
const server_1 = __importDefault(require("../utils/server"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const patientId = "65a00885d9f8cef48a635797";
const staffId = "65a0562d9876e736f6cf2858";
const app = (0, server_1.default)();
describe("/v1/dashboards endpoint", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (connectionString) {
            yield mongoose_1.default.connect(connectionString);
            console.log("Connected to MongoDB for testing");
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Close the server
        // server.close();
        // Close the database connection, if applicable
        yield mongoose_1.default.connection.close();
    }));
    describe("get patient dashboard", () => {
        describe("given a valid patient id", () => {
            let res;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                res = yield (0, supertest_1.default)(app).get(`/v1/dashboards/patient/${patientId}`);
            }));
            it("should return a 200 status code", () => {
                expect(res.statusCode).toBe(200);
            });
            it("should return an userProfile", () => {
                expect(res.body).toHaveProperty("userId");
                expect(res.body).toHaveProperty("role", "patient");
            });
        });
        describe("given an invalid patient id", () => {
            let res;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                res = yield (0, supertest_1.default)(app).get(`/v1/dashboards/${staffId}`);
            }));
            it("should return status code 400", () => {
                expect(res.statusCode).toBe(400);
            });
            it("should return a proper error message", () => {
                expect(res.body).toBe("Bad request. Provided invalid user id.");
            });
        });
    });
});
