const router = require('express').Router();
const advertiserController = require('../controllers/advertiserController');
const campaignController = require('../controllers/campaignController');
const { isAdvertiserEditor, isAdvertiserViewer, isCampaignViewer } = require('../middlewares/auth');

router.get('/', advertiserController.getAllAccessAdvertiser);
router.get('/details', advertiserController.getAllDetails);
router.get('/:advertiserId', isAdvertiserViewer, advertiserController.getOne);
router.get('/details/:advertiserId',isAdvertiserViewer, advertiserController.getOneDetail);

router.post('/', advertiserController.create);
router.post('/:advertiserId/campaigns',isAdvertiserEditor , campaignController.create);
router.post('/:advertiserId/share', isAdvertiserEditor, advertiserController.share);
router.post('/:advertiserId/unshare', isAdvertiserEditor, advertiserController.unshare);

router.put('/:advertiserId', isAdvertiserEditor, advertiserController.update);


module.exports = router;