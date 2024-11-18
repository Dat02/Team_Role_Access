const router = require('express').Router();
const teamController = require('../controllers/teamController');
const { checkRole } = require('../middlewares/auth');
const { getTeamRule,createTeamRule, addMemberRule,deleteManagerRule, 
        deleteMemberRule, addManagerRule, updateTeamRule } = require('../helpers/inputRules');
const inputValidator = require('../middlewares/validator');


router.get('/', teamController.getAll);
router.get('/details', teamController.getAllDetails);
router.get('/:teamId',getTeamRule,inputValidator, teamController.getTeam);

router.post('/', createTeamRule, inputValidator, checkRole(process.env.MANAGER_ROLE_ID), teamController.create);
router.post('/:teamId/members', addMemberRule, inputValidator, teamController.addMember);
router.post('/:teamId/managers', addManagerRule, inputValidator,  checkRole(process.env.MANAGER_ROLE_ID), teamController.addManager);
// update and insert team
router.post('/:teamId/update/', updateTeamRule, inputValidator, teamController.updateTeam);

router.delete('/:teamId/members/:memberId', deleteMemberRule, inputValidator, teamController.deleteMember);
router.delete('/:teamId/managers/:managerId', deleteManagerRule, inputValidator, checkRole(process.env.MANAGER_ROLE_ID), teamController.deleteManager);

router.get('/members/all', teamController.getRecursive);

module.exports = router;