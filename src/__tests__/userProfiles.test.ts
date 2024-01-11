import dotenv from "dotenv";
import { UserProfile } from "../types/UserProfile";
import supertest from "supertest";
// import app, { server } from "../server";
import mongoose from "mongoose";

import createServer from "../utils/server";
dotenv.config();

const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const app = createServer();
let userProfileMongoId = "";

describe("/v1/userProfiles endpoint", () => {
  beforeAll(async () => {
    if (connectionString) {
      await mongoose.connect(connectionString);
      console.log("Connected to MongoDB for testing");
    }
  });

  describe("get request", () => {
    it("should return a 200 status and an array of user profiles", async () => {
      const res = await supertest(app).get("/v1/userProfiles").expect(200);
      // expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      res.body.forEach((profile: UserProfile) => {
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
    });

    it("should handle errors correctly", async () => {
      await mongoose.connection.close();

      const res = await supertest(app).get("/v1/userProfiles");
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual("Failed to fetch user profiles");

      if (connectionString) {
        await mongoose.connect(connectionString);
      }
    });
  });

  describe("post request", () => {
    it("should return a 201 status and a user profile object", async () => {
      const newUserProfile = {
        userId: new mongoose.Types.ObjectId().toString(),
        name: "John Doe",
        governmentId: new mongoose.Types.ObjectId().toString(),
        phone: "123-456-7890",
        address: "123 Main St",
      };

      const res = await supertest(app)
        .post("/v1/userProfiles")
        .send(newUserProfile)
        .expect(201);

      userProfileMongoId = res.body._id;
      expect(res.body).toHaveProperty("userId", newUserProfile.userId);
      expect(res.body).toHaveProperty("name", newUserProfile.name);
      expect(res.body).toHaveProperty(
        "governmentId",
        newUserProfile.governmentId
      );
    });

    it("should handle errors correctly", async () => {
      const res = await supertest(app).post("/v1/userProfiles").expect(500);

      expect(res.body).toEqual("Failed to create user profile");
    });
  });

  describe("put request", () => {
    it("should return a 200 status and a MongoDB update summary object", async () => {
      const updatedUserProfile = {
        userId: new mongoose.Types.ObjectId().toString(),
        name: "John Doe",
        governmentId: "659f6a77870ab60f0f77e8ce",
        phone: "123-456-7890",
        address: "123 Main St",
      };

      const res = await supertest(app)
        .put(`/v1/userProfiles/${userProfileMongoId}`)
        .send(updatedUserProfile)
        .expect(200);

      expect(res.body).toHaveProperty("acknowledged", true);
      expect(res.body).toHaveProperty("modifiedCount", 1);
      expect(res.body).toHaveProperty("matchedCount", 1);
    });

    it("should handle errors correctly", async () => {
      const res = await supertest(app)
        .put(`/v1/userProfiles/${userProfileMongoId}`)
        .expect(500);

      expect(res.body).toEqual("Failed to update user profile");
    });
  });

  describe("delete request", () => {
    it("should return a 200 status and a MongoDB delete result object", async () => {
      const res = await supertest(app)
        .delete(`/v1/userProfiles/${userProfileMongoId}`)
        .expect(200);

      expect(res.body).toHaveProperty("acknowledged", true);
      expect(res.body).toHaveProperty("deletedCount", 1);
    });

    it("should handle errors correctly", async () => {
      await mongoose.connection.close();
      
      const res = await supertest(app).post("/v1/userProfiles").expect(500);

      expect(res.body).toEqual("Failed to create user profile");
    });
  });

  afterAll(async () => {
    // Close the server
    // server.close();
    // Close the database connection, if applicable
    await mongoose.connection.close();
  });
});
