const express = require('express');
const router = express.Router();
const syosetuPageRoutes = require('./syosetuPageRoutes')

router.use('/syosetu', syosetuPageRoutes)

module.exports = router