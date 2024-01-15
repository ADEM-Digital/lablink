import dotenv from "dotenv";
import supertest, { Response } from "supertest";
import createServer from "../utils/server";
import mongoose from "mongoose";
import { Test } from "../types/Test";
dotenv.config();

const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const app = createServer();

describe("/v1/tests endpoint", () => {
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

  describe("get request", () => {
    describe("given no parameters", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).get("/v1/tests");
      });

      it("should return a 200 status code", () => {
        expect(res.statusCode).toBe(200);
      });

      it("should return an array of tests documents", () => {
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach((test: Test) => {
          expect(test).toHaveProperty("name");
          expect(test).toHaveProperty("description");
        });
      });
    });

    describe("given parameters", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).get("/v1/tests?name=Lipid Panel");
      });
      it("should return status code 200", () => {
        expect(res.statusCode).toBe(200);
      });
      it("should return a list of test documents correctly filtered", () => {
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach((test: Test) => {
          expect(test).toHaveProperty("name", "Lipid Panel");
          expect(test).toHaveProperty("description");
          expect(test).toHaveProperty("resultTime");
        });
      });
    });
  });
});
