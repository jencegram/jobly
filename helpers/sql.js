const { BadRequestError } = require("../expressError");

/**
 * 
 * @param {Object} dataToUpdate - An object containing key-value pairs of coulmns to update.
 * example: {firstName: 'Aliya', age:32}
 * 
 * @param {Object} jsToSql - An object that maps JavaScript-style camel case names to their corresponding SQL-style names. 
 * example: {firstName: "first_name", lastName: "last_name"}
 * 
 * @returns {Object} - An object containing SQL query string fragment and an array of values to substitute.
 * example: 
 * {
 *  setCols: ' "first_name"= $1, "age"=$2',
 *  values: ['Aliya', 32]
 * }
 * 
 * @throws {BadRequestError} - If no data is passed to update. 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
