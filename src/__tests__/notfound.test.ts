import supertest from "supertest";
import createServer from "../utils/server";

const app = createServer();

describe("404 middleware", () => {
  describe("get non existent route", () => {
    describe("given route unreachable", () => {
      it("should return a 404", async () => {
        await supertest(app).get(`/non-existent-route`).expect(404);
      });
    });
  });
});
