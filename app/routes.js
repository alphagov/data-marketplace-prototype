//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { promises: fs } = require("fs");

let cache = {};
let itemsjs;
let items;

// #################################################
// Global
// #################################################

// None

// #################################################
// Secure
// #################################################

const secure_dev = require('./routes/secure/dev.js')
router.use('', secure_dev);

const secure_ur = require('./routes/secure/ur.js')
router.use('', secure_ur);

const secure_wip = require('./routes/secure/wip.js')
router.use('', secure_wip);

// #################################################
// Find (Acquirer)
// #################################################

const find_dev = require('./routes/find/dev.js')
router.use('', find_dev);

const find_ur = require('./routes/find/ur.js')
router.use('', find_ur);

const find_wip = require('./routes/find/wip.js')
router.use('', find_wip);


// #################################################
// Request (Acquirer)
// #################################################

const request_dev = require('./routes/request/dev.js')
router.use('', request_dev);

const request_ur = require('./routes/request/ur.js')
router.use('', request_ur);

const request_wip = require('./routes/request/wip.js')
router.use('', request_wip);


// #################################################
// Publish (Supplier) 
// #################################################

const publish_dev = require('./routes/publish/dev.js')
router.use('', publish_dev);

const publish_ur = require('./routes/publish/ur.js')
router.use('', publish_ur);

const publish_wip = require('./routes/publish/wip.js')
router.use('', publish_wip);


// #################################################
// Review request (Supplier)
// #################################################

const reviewRequest_dev = require('./routes/review-request/dev.js')
router.use('', reviewRequest_dev);

const reviewRequest_ur = require('./routes/review-request/ur.js')
router.use('', reviewRequest_ur);

const reviewRequest_wip = require('./routes/review-request/wip.js')
router.use('', reviewRequest_wip);

// #################################################
// Manage-shares 
// #################################################

const manageShares_dev = require('./routes/manage-shares/dev.js')
router.use('', manageShares_dev);

const manageShares_ur = require('./routes/manage-shares/ur.js')
router.use('', manageShares_ur);

const manageShares_wip = require('./routes/manage-shares/wip.js')
router.use('', manageShares_wip);

// #################################################
// Developer
// #################################################

require('./routes/developer/wip.js')

// #################################################
// Support
// #################################################

require('./routes/support/wip.js')

module.exports = router;