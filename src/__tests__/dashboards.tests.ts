import dotenv from "dotenv";
import supertest, { Response } from "supertest";
import createServer from "../utils/server";
import mongoose from "mongoose";
import { Test } from "../types/Test";
dotenv.config();

const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const patientId = "65a00885d9f8cef48a635797";
const staffId = "65a0562d9876e736f6cf2858";
const app = createServer();

describe("/v1/dashboards endpoint", () => {
  beforeAll(async () => {
    if (connectionString) {
      await mongoose.connect(connectionString);
      console.log("Connected to MongoDB for testing");
    }
  });

  afterAll(async () => {
    // Close the server
    // server.close();
    // Close the database connection, if applicable
    await mongoose.connection.close();
  });

  describe("get patient dashboard", () => {
    describe("given a valid patient id", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).get(`/v1/dashboards/patient/${patientId}`);
      });

      it("should return a 200 status code", () => {
        expect(res.statusCode).toBe(200);
      });

      it("should return an userProfile", () => {

          expect(res.body).toHaveProperty("userId");
          expect(res.body).toHaveProperty("role", "patient");
   
      });
    });

    describe("given an invalid patient id", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).get(`/v1/dashboards/${staffId}`);
      });
      it("should return status code 400", () => {
        expect(res.statusCode).toBe(400);
      });
      it("should return a proper error message", () => {
        expect(res.body).toBe("Bad request. Provided invalid user id.");
      });
    });
  });
});
