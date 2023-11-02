const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  
  // Test Case 1: Updating a user's first name
  test("works: updating first name", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John" },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ["John"],
    });
  });

  // Test Case 2: Updating a user's first name and age
  test("works: updating first name and age", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      { firstName: "first_name", age: "age" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"age\"=$2",
      values: ["John", 30],
    });
  });


  // Test Case 3: No data to update
  test("throws BadRequestError with no data", function () {
    expect(() => sqlForPartialUpdate({}, {})).toThrow(new BadRequestError("No data"));
  });
});

// Test Case 4: Updating a user's first name (with mapping) and address (without mapping)
test("works: updating first name with mapping and address without mapping", function () {
  const result = sqlForPartialUpdate(
    { firstName: "John", address: "123 Main St" },
    { firstName: "first_name" }
  );
  expect(result).toEqual({
    setCols: "\"first_name\"=$1, \"address\"=$2",
    values: ["John", "123 Main St"],
  });
});
