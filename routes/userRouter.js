const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');


router.get('/', userController.getAll);
router.post('/login', userController.login);
router.get('/:userId', userController.getUser);
router.post('/', verifyToken, userController.createUser);


module.exports = router;