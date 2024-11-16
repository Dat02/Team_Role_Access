const router = require('express').Router();
const campaignController = require('../controllers/campaignController');
const { isCampaignViewer, isCampaignEditor } = require('../middlewares/auth');

router.get('/', campaignController.getAllAccess);
router.get('/details', campaignController.getAllDetails);
router.get('/:campaignId', isCampaignViewer, campaignController.getOne);
router.get('/details/:campaignId', isCampaignViewer, campaignController.getOneDetails);

router.post('/:campaignId/share', isCampaignEditor, campaignController.share);
router.post('/:campaignId/unshare', isCampaignEditor, campaignController.unshare);

router.put('/:campaignId', isCampaignEditor, campaignController.update);


module.exports = router;