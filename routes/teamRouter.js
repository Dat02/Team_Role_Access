const router = require('express').Router();
const teamController = require('../controllers/teamController');
const { checkRole } = require('../middleware/auth');


// router.get('/', teamController.getAll);
// router.get('/:teamId', teamController.getTeam);
router.post('/', checkRole(3),teamController.create);
router.post('/:teamId/members', teamController.addMember);
router.post('/:teamId/managers', checkRole(3), teamController.addManager);
router.delete('/:teamId/members/:memberId', teamController.deleteMember);
// // tai sao o day k delete('/:teamId/:memberId') -> vi de phan biet xoa memberId vs managerId
router.delete('/:teamId/managers/:managerId', checkRole(3), teamController.deleteManager);

// update and insert team
router.post('/:teamId/all/', teamController.updateTeam);


module.exports = router;