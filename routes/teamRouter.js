const router = require('express').Router();
const teamController = require('../controllers/teamController');
const { checkRole } = require('../middleware/auth');
const { getTeamRule,createTeamRule, addMemberRule,deleteManagerRule,deleteMemberRule,addManagerRule } = require('../middleware/rules');
const inputValidator = require('../middleware/validator');


router.get('/', teamController.getAll);
router.get('/details', teamController.getAllDetails);
router.get('/:teamId',getTeamRule,inputValidator, teamController.getTeam);

router.post('/', checkRole(3), createTeamRule, inputValidator, teamController.create);
router.post('/:teamId/members',addMemberRule, inputValidator, teamController.addMember);
router.post('/:teamId/managers', checkRole(3), addManagerRule, inputValidator,  teamController.addManager);
router.delete('/:teamId/members/:memberId', deleteMemberRule, inputValidator, teamController.deleteMember);
router.delete('/:teamId/managers/:managerId', checkRole(3),deleteManagerRule, inputValidator, teamController.deleteManager);

// update and insert team
router.post('/:teamId/all/', inputValidator, teamController.updateTeam);


module.exports = router;