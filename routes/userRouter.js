const router = require('express').Router();
const userController = require('../controllers/userController');
const { getUserRule, getListUserRule, loginUserRule, registerUserRule } = require('../helpers/inputRules');
const inputValidator = require('../middlewares/validator');


router.get('/', userController.getAllUser);
router.get('/:userId',getUserRule, inputValidator, userController.getUser);
router.get('/logout', userController.logOut);

router.post('/list', getListUserRule, inputValidator, userController.getListUser);
router.post('/login', loginUserRule, inputValidator, userController.logIn);
router.post('/', registerUserRule, inputValidator, userController.signUp);


module.exports = router;