"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/jobs"); 
const { createToken } = require("../helpers/tokens");

let testJobIds = []; // Array to store job IDs for use in tests

async function commonBeforeAll() {
    // Delete existing data
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM users");

    // Create test companies
    await Company.create({
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
    });
    await Company.create({
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
    });
    await Company.create({
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
    });

    // Create test jobs and store their IDs
    testJobIds[0] = (await Job.create({
        title: "Job1",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
    })).id;
    testJobIds[1] = (await Job.create({
        title: "Job2",
        salary: 120000,
        equity: "0.2",
        companyHandle: "c1"
    })).id;
    testJobIds[2] = (await Job.create({
        title: "Job3",
        salary: 110000,
        equity: null,
        companyHandle: "c2"
    })).id;

    // Register test users
    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });
    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: false,
    });
    await User.register({
        username: "admin",
        firstName: "Admin",
        lastName: "Admin",
        email: "admin@user.com",
        password: "passwordAdmin",
        isAdmin: true,
    });
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
};

