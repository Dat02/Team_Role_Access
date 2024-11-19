const router = require('express').Router();
const advertiserController = require('../controllers/advertiserController');
const campaignController = require('../controllers/campaignController');
const { createAdvertiserRule, createCampaignRule, updateRule, shareAdvertiserRule } = require('../helpers/inputRules');
const { isAdvertiserEditor, isAdvertiserViewer, isCampaignViewer } = require('../middlewares/auth');
const inputValidator = require('../middlewares/validator');

router.get('/', advertiserController.getAllAccessAdvertiser);
// router.get('/details', advertiserController.getAllDetails);
router.get('/:advertiserId', isAdvertiserViewer, advertiserController.getOne);
router.get('/details/:advertiserId',isAdvertiserViewer, advertiserController.getOneDetail);

router.post('/', createAdvertiserRule, inputValidator, advertiserController.create);
router.post('/:advertiserId/campaigns', createCampaignRule, inputValidator, isAdvertiserEditor, campaignController.create);
router.post('/:advertiserId/share', shareAdvertiserRule, inputValidator, isAdvertiserEditor,  advertiserController.share);
router.post('/:advertiserId/unshare', shareAdvertiserRule, inputValidator, isAdvertiserEditor,  advertiserController.unshare);
router.post('/advertiserId/resetowner/:ownerId', advertiserController.assignOwner);

router.put('/:advertiserId', updateRule, inputValidator, isAdvertiserEditor, advertiserController.update);


module.exports = router;