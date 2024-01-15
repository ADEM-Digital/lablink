import dotenv from "dotenv";
import supertest, { Response } from "supertest";
import mongoose from "mongoose";

import createServer from "../utils/server";
import { ServiceType } from "../types/Service";
import { Service } from "../models/Service.model";
import { ObjectId } from "mongodb";
dotenv.config();

const connectionString = process.env.MONGO_DB_TEST_CONNECTION_STRING;
const app = createServer();
let patientUserId = "65a00885d9f8cef48a635797";
let staffUserId = "staffUserId";
let invalidRoleUserId = "invalidUserId";
let newService = {
  user: "65a00885d9f8cef48a635797",
  status: "pending results",
  tests: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

let newServiceId = "";

describe("/v1/services endpoint", () => {
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
    describe("given a valid patient userId", () => {
      let res: Response; // Declare res here

      beforeAll(async () => {
        // Move the async operation inside beforeAll
        res = await supertest(app).get(`/v1/services/user/${patientUserId}`);
      });
      it("should return a 200 status code", () => {
        expect(res.statusCode).toBe(200);
      });

      it("should return an array of services", () => {
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach((service: ServiceType) => {
          expect(service).toHaveProperty("createdAt");
          expect(service).toHaveProperty("updatedAt");
          expect(service).toHaveProperty("status");
          expect(["pending results", "results uploaded", "opened"]).toContain(
            service.status
          );

          if (service.tests) {
            expect(Array.isArray(service.tests)).toBeTruthy();
            service.tests.forEach((test) => {
              expect(test).toHaveProperty("_id");
              expect(test).toHaveProperty("name");
              expect(test).toHaveProperty("description");
            });
          }

          if (service.results) {
            expect(service.results).toBe("string");
          }
        });
      });
      describe("given a valid patient userId", () => {
        it("the array of services should be related to the given patient", () => {
          res.body.forEach((service: ServiceType) => {
            expect(service).toHaveProperty("user", patientUserId);
          });
        });
      });
    });

    describe("given a valid staff userId", () => {
      let res: Response; // Declare res here

      beforeAll(async () => {
        // Move the async operation inside beforeAll
        res = await supertest(app)
          .get(`/v1/services/user/${staffUserId}`)
          .expect(200);
      });
      it("should return a 200 status code", async () => {
        expect(res.statusCode).toBe(200);
      });
      it("should return an array of services", () => {
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach((service: ServiceType) => {
          expect(service).toHaveProperty("createdAt");
          expect(service).toHaveProperty("updatedAt");
          expect(service).toHaveProperty("status");
          expect(["pending results", "results uploaded", "opened"]).toContain(
            service.status
          );

          if (service.tests) {
            expect(Array.isArray(service.tests)).toBeTruthy();
            service.tests.forEach((test) => {
              expect(test).toHaveProperty("_id");
              expect(test).toHaveProperty("name");
              expect(test).toHaveProperty("description");
            });
          }

          if (service.results) {
            expect(service.results).toBe("string");
          }
        });
      });
      it("it should return all services", async () => {
        try {
          const collectionCount = await Service.countDocuments({});
          expect(res.body.length).toBe(collectionCount);
        } catch (error) {
          console.log(error);
        }
      });
    });

    describe("given a valid userId with an invalid role", () => {
      it("should return a status code 500", async () => {
        const res = await supertest(app)
          .get(`/v1/services/user/${invalidRoleUserId}`)
          .expect(500);
        expect(res.body).toBe("The user has an invalid role.");
      });
    });

    it("should handle errors correctly", async () => {
      await mongoose.connection.close();

      const res = await supertest(app).get("/v1/services/user/invalid");
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual("Failed to fetch services");

      if (connectionString) {
        await mongoose.connect(connectionString);
      }
    });
  });

  describe("post requests", () => {
    describe("given a valid request body", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).post(`/v1/services`).send(newService);
        newServiceId = res.body._id.toString();
      });

      it("should return a 201 status code", () => {
        expect(res.statusCode).toBe(201);
      });

      it("should return a service document", () => {
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("user");
        expect(res.body).toHaveProperty("status");
        expect(
          ["pending results", "results uploaded", "opened"].includes(
            res.body.status
          )
        ).toBeTruthy();
        expect(res.body).toHaveProperty("createdAt");
        expect(res.body).toHaveProperty("updatedAt");

        if (res.body.tests) {
          expect(Array.isArray(res.body.tests)).toBeTruthy();
          res.body.tests.forEach((test: ObjectId) => {
            expect(test).toBe(ObjectId);
          });
        }

        if (res.body.results) {
          expect(typeof res.body.results).toBe("string");
        }
      });
    });

    describe("given a bad request body", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app)
          .post("/v1/services")
          .send({ ...newService, status: "completed" });
      });
      it("should return status code 500", () => {
        expect(res.statusCode).toBe(500);
      });
      it("should send an appropriate response body", () => {
        expect(res.body).toBe("Failed to create a service");
      });
    });

    describe("given no request body", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).post("/v1/services");
      });

      it("should return a 400 status code", () => {
        expect(res.statusCode).toBe(400);
      });

      it("should send an appropriate response body", () => {
        expect(res.body).toBe("Bad request. The request should have a body.");
      });
    });
  });

  describe("put requests", () => {
    describe("given a valid service id", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app)
          .put(`/v1/services/${newServiceId}`)
          .send({ updatedAt: new Date() });
      });

      it("should return a 200 status code", () => {
        expect(res.statusCode).toBe(200);
      });

      it("should return the MongoDB updated document", () => {
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("user");
      });
    });

    describe("given an non existent service id", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app)
          .put(`/v1/services/65a0555e19c932096165cc4d`)
          .send({ updatedAt: new Date() });
      });

      it("should return a 400 status code", () => {
        expect(res.statusCode).toBe(400);
      });

      it("should return an appropriate error message", () => {
        expect(res.body).toBe(
          "Bad request. The provided serviceId doesn't exist in the database"
        );
      });
    });

    describe("given an invalid service id string", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).put("/v1/services/invalidServiceId");
      });

      it("should return a 400 status code", () => {
        expect(res.statusCode).toBe(400);
      });

      it("should return a proper error code", () => {
        expect(res.body).toBe(
          "Bad request. The provided service id is not a valid ObjectId string."
        );
      });
    });

    describe("given a request with no body", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).put(`/v1/services/${newServiceId}`);
      });
      it("should return a 400 status code", () => {
        expect(res.statusCode).toBe(400);
      });
      it("should return a proper error message", () => {
        expect(res.body).toBe(
          "Bad request. The request must have a valid request body."
        );
      });
    });

    describe("given an error", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app)
          .put(`/v1/services/${newServiceId}`)
          .send({ ...newService, status: "completed" });
      });

      it("should return a 500 status code", () => {
        expect(res.statusCode).toBe(500);
      });

      it("should send a proper error message", () => {
        expect(res.body).toBe("Failed to update the service");
      });
    });
  });

  describe("delete requests", () => {
    describe("given an invalid service id", () => {
      let res: Response;
      beforeAll(async () => {
        res = await supertest(app).delete(`/v1/services/${newServiceId}`);
      });
      it("should return a 200 status code", () => {
        expect(res.statusCode).toBe(200);
      });
      it("should return a MongoDB delete result object", () => {
        expect(res.body).toHaveProperty("acknowledged", true);
        expect(res.body).toHaveProperty("deletedCount", 1);
      });
    });

    describe("given a valid ObjectId that doesn't exist", () => {
        let res: Response;
        beforeAll(async () => {
            res = await supertest(app).delete("/v1/services/65a0555e19c932096165cc4d");
        })
        it("should return a 400 status code", () => {
            expect(res.statusCode).toBe(400);
        });
        it("should return a proper error message", () => {
            expect(res.body).toBe("Bad request. The provided ObjectId doesn't exist in the database.")
        })
    })

    describe("given an invalid ObjectId string", () => {
        let res: Response;
        beforeAll(async () => {
            res = await supertest(app).delete("/v1/services/invalidObjectId");
        })
        it("should return a 400 status code", () => {
            expect(res.statusCode).toBe(400);
        });
        it("should return a proper error message", () => {
            expect(res.body).toBe("Bad request. The provided service id is not a valid ObjectId string.")
        })
    })
  });
});
