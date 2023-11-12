"use strict";
const jobSearchSchema = require("../schemas/jobSearch.json");
const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST /jobs - Create a new job.
 * 
 * Data should be { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs - Get list of jobs with optional filtering.
 * 
 * Can filter on provided search filters:
 * - title (case-insensitive, matches any part of the string)
 * - minSalary (minimum salary)
 * - hasEquity (true returns only jobs with non-zero equity)
 * 
 * Returns [{ id, title, salary, equity, companyHandle }, ...]
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    // Convert query parameters to correct types
    if (req.query.minSalary !== undefined) req.query.minSalary = +req.query.minSalary;
    req.query.hasEquity = req.query.hasEquity === "true";

    // Validate query parameters using jobSearchSchema
    const validator = jsonschema.validate(req.query, jobSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { title, minSalary, hasEquity } = req.query;
    const filters = { title, minSalary, hasEquity };

    const jobs = await Job.findAll(filters);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs/:id - Get detail of a specific job.
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    return next(err);
  }
});

/** PATCH /jobs/:id - Update a job.
 * 
 * Fields that can be updated: { title, salary, equity }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /jobs/:id - Delete a job.
 * 
 * Returns { deleted: id }
 * 
 * Authorization required: admin
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
