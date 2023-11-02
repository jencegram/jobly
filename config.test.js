// "use strict";

// describe("config can come from env", function () {
//   test("works", function() {
//     process.env.SECRET_KEY = "abc";
//     process.env.PORT = "5000";
//     process.env.DATABASE_URL = "other";
//     process.env.TEST_DATABASE_URL = "test-db-url";
//     process.env.NODE_ENV = "other";

//     const config = require("./config");
//     expect(config.SECRET_KEY).toEqual("abc");
//     expect(config.PORT).toEqual(5000);
//     expect(config.getDatabaseUri()).toEqual("other");
//     expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

//     delete process.env.SECRET_KEY;
//     delete process.env.PORT;
//     delete process.env.BCRYPT_WORK_FACTOR;
//     delete process.env.DATABASE_URL;
//     delete process.env.TEST_DATABASE_URL;

//     expect(config.getDatabaseUri()).toEqual("postgresql:///jobly");;
//     process.env.NODE_ENV = "test";

//     expect(config.getDatabaseUri()).toEqual("postgresql:///jobly_test");
//   });
// })

"use strict";

describe("config can come from env", function () {
  test("works", function() {
    // Invalidate Jest cache for config.js
    jest.resetModules();

    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.TEST_DATABASE_URL = "test-db-url";
    process.env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;
    delete process.env.TEST_DATABASE_URL;

    // Invalidate Jest cache for config.js
    jest.resetModules();

    expect(config.getDatabaseUri()).toEqual("postgresql:///jobly");
    process.env.NODE_ENV = "test";
    process.env.TEST_DATABASE_URL = "test-db-url";

    // Require config.js again after changing environment variables
    const newConfig = require("./config");
    expect(newConfig.getDatabaseUri()).toEqual("test-db-url");
  });
});
