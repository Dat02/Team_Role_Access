const router = require('express').Router();
const campaignController = require('../controllers/campaignController');
const { isCampaignViewer, isCampaignEditor } = require('../middlewares/auth');

router.get('/', campaignController.getAll);
router.get('/details', campaignController.getAllDetails);
router.get('/:campaignId', isCampaignViewer, campaignController.getOne);
router.get('/details/:campaignId', isCampaignViewer, campaignController.getOneDetails);

router.post('/:campaignId/share', isCampaignEditor);


router.put('/:campaignId', isCampaignEditor, campaignController.update);


module.exports = router;