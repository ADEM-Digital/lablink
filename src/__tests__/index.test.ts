import supertest from "supertest";
import createServer from "../utils/server";

const app = createServer();

describe("index", () => {
  describe("get index route", () => {
    describe("index should be reachable", () => {
      it("should return a 200", async () => {
        await supertest(app).get(`/`).expect(200);
      });
    });
  });
});