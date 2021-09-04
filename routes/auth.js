const { Router } = require('express');
const controllers = require('../controllers/auth');

const router = Router();

router.post('/auth/verify', controllers.verifyUser); // POST
router.post('/auth/login', controllers.loginUser); // POST

module.exports = router;
