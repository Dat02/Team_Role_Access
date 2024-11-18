const router = require('express').Router();
const campaignController = require('../controllers/campaignController');
const { updateRule, shareCampaignRule } = require('../helpers/inputRules');
const { isCampaignViewer, isCampaignEditor } = require('../middlewares/auth');
const inputValidator = require('../middlewares/validator');

router.get('/', campaignController.getAllAccess);
// router.get('/details', campaignController.getAllDetails);
router.get('/:campaignId', isCampaignViewer, campaignController.getOne);
router.get('/details/:campaignId', isCampaignViewer, campaignController.getOneDetails);

router.post('/:campaignId/share', shareCampaignRule, inputValidator, isCampaignEditor, campaignController.share);
router.post('/:campaignId/unshare', shareCampaignRule, inputValidator, isCampaignEditor, campaignController.unshare);

router.put('/:campaignId', updateRule, inputValidator, isCampaignEditor, campaignController.update);

module.exports = router;