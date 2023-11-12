"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Job = require("../models/jobs");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  adminToken,
  u1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New Job",
    salary: 50000,
    equity: 0.1,  
    companyHandle: "c1"
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    if (resp.statusCode === 400) {
      console.log("Error details:", resp.body);
    }

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("unauthorized for non-admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});


/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[0],
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 120000,
          equity: "0.2",
          companyHandle: "c1"
        },
        {
          id: testJobIds[2],
          title: "Job3",
          salary: 110000,
          equity: null,
          companyHandle: "c2"
        }
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Job1",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /jobs with filters */

describe("GET /jobs with filters", function () {
  test("works: filtering by title", async function () {
    const resp = await request(app).get("/jobs").query({ title: "Job1" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[0],
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works: filtering by minSalary", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 105000 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 120000,
          equity: "0.2",
          companyHandle: "c1"
        },
        {
          id: testJobIds[2],
          title: "Job3",
          salary: 110000,
          equity: null,
          companyHandle: "c2"
        }
      ]
    });
  });

  test("works: filtering by hasEquity", async function () {
    const resp = await request(app).get("/jobs").query({ hasEquity: true }); // Pass boolean true
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[0],
          title: "Job1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 120000,
          equity: "0.2",
          companyHandle: "c1"
        }
      ]
    });
  });

  
  test("fails: invalid query parameter", async function () {
    const resp = await request(app).get("/jobs").query({ invalidParam: "test" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "Updated Job"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Updated Job",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "Updated Job"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });

});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0].toString() });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });

});
