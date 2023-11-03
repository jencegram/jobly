"use strict";
const db = require("../db");

const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Generate JWTs for an admin user and a regular user for testing
const testAdminJwt = jwt.sign({ username: "admin", isAdmin: true }, SECRET_KEY);
const testUserJwt = jwt.sign({ username: "user", isAdmin: false }, SECRET_KEY);


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

// Set up and tear down the database before and after tests
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

// Tests related to POST requests to the /companies endpoint
describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  // Test: Admins should be able to create a new company
  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  // Test: Request should fail if required data is missing
  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toEqual(400);
  });

  // Test: Request should fail if data is invalid
  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toEqual(400);
  });

  // Test: Non-admin users should not be able to create a new company
  test("unauth for non-admins", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("Authorization", `Bearer ${testUserJwt}`);
    expect(resp.statusCode).toBe(403);  // Updated from 401 to 403
  });
});


/************************************** GET /companies */
// Tests related to GET requests to the /companies endpoint
describe("GET /companies", function () {
   // Test: Any user, even anonymous, should be able to fetch the list of companies
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          },
          {
            handle: "c2",
            name: "C2",
            description: "Desc2",
            numEmployees: 2,
            logoUrl: "http://c2.img",
          },
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          },
        ],
    });
  });

  // Test: The error handler should catch any unexpected failures
  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
      .get("/companies")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

// Tests related to GET requests to fetch a specific company by its handle
describe("GET /companies/:handle", function () {
  // Test: Any user should be able to fetch a company by its handle
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  // Test: Check if the endpoint works for a company without any jobs
  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  // Test: Request should return 404 if the company is not found
  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /companies with filters */

// Tests related to fetching companies with certain filters
describe("GET /companies with filters", function () {
  // Test: It should work when filtering by name
  test("works: by name", async function () {
    const resp = await request(app).get("/companies").query({ name: 'C1' });
    expect(resp.body).toEqual({
      companies: [
        {
          description: "Desc1",
          handle: "c1",
          logoUrl: "http://c1.img",
          name: "C1",
          numEmployees: 1,
        }
      ]
    });
  });

  // Test: Request should return 400 if an invalid filter is used
  test("bad request with invalid filter", async function () {
    const resp = await request(app).get("/companies").query({ color: 'red' });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: "Invalid field: color",
        status: 400
      }
    });
  });
});

/************************************** PATCH /companies/:handle */
// Tests related to updating a company's data via PATCH request
describe("PATCH /companies/:handle", function () {
  // Test: Admins should be able to update a company's data
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  // Test: Non-admin users should not be able to update a company's data
  test("unauth for non-admins", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${testUserJwt}`);
    expect(resp.statusCode).toBe(403);  // Updated from 401 to 403
  });

  // Test: Request should return 404 if the company is not found
  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/no-such-company`)
      .send({
        name: "No such company",
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toBe(404);
  });

  // Test: Request should return 400 if an attempt is made to change the handle
  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toBe(400);
  });

  // Test: Request should return 400 if invalid data is sent
  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toBe(400);
  });
});

/************************************** DELETE /companies/:handle */
// Tests related to deleting a company via DELETE request
describe("DELETE /companies/:handle", function () {
  // Test: Admins should be able to delete a company
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  // Test: Non-admin users should not be able to delete a company
  test("unauth for non-admins", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${testUserJwt}`);
    expect(resp.statusCode).toBe(403);  // Updated from 401 to 403
  });

  // Test: Request should return 404 if the company is not found
  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/no-such-company`)
      .set("authorization", `Bearer ${testAdminJwt}`);
    expect(resp.statusCode).toBe(404);
  });
});
