const router = require('express').Router();
const authController = require('../controllers/authController');
const { getUserRule, getListUserRule, loginUserRule, registerUserRule } = require('../helpers/inputRules');
const inputValidator = require('../middlewares/validator');


router.get('/', authController.getAllUser);
router.get('/:userId',getUserRule, inputValidator, authController.getUser);
router.get('/logout', authController.logOut);

router.post('/list', getListUserRule, inputValidator, authController.getListUser);
router.post('/login', loginUserRule, inputValidator, authController.logIn);
router.post('/', registerUserRule, inputValidator, authController.register);


module.exports = router;