const router = require('express').Router();
const authController = require('../controllers/authController')

router.get('/', authController.getAllUser);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/', authController.register);


module.exports = router;