const campaignService = require('../services/campaignService');

class CampaignController {
    constructor() {
        this.campaignService = campaignService;
    }

    getAllAccess = async (req,res,next) => {
        try {
            const userId = req.user.user_id;
            const campaigns = await this.campaignService.findAllAccess(userId);
            res.status(200).json(campaigns);
        } catch (error) {
            next(error);
        }
    }

    getAllDetails = async (req,res,next) => {
        try {
            const allCampaigns = await this.campaignService.findAllDetails();
            res.status(200).json({allCampaigns})
        } catch (error) {
            next(error);
        }
    }

    getOne = async (req,res,next) => {
        try {
            const {campaignId} = req.params;
            const campaign = await this.campaignService.findbyId(campaignId);
            res.status(200).json(campaign);
        } catch (error) {
            next(error);
        }
    }

    getOneDetails = async (req,res,next) => {
        try {
            const {campaignId} = req.params;
            const campaign = await this.campaignService.findDetailsById(campaignId);
            res.status(200).json(campaign);
        } catch (error) {
            next(error);
        }
    }

    create = async (req,res,next) => {
        try {
            const {campaignName, startDate, endDate, editors, viewers} = req.body;
            const {advertiserId} = req.params;
            const userId = req.user.user_id;
            const campaignToSave = {campaignName,startDate,endDate,createdBy: userId, advertiserId, editors, viewers};
            const newCampaign = await this.campaignService.save(campaignToSave);

            res.status(200).json({...newCampaign, editors, viewers});
        } catch (error) {
            next(error);
        }
    }

    share = async(req,res,next) => {
        try {
            const campaignId = req.params.campaignId;
            const {editors, viewers} = req.body;

            await this.campaignService.saveDetails({campaignId, editors, viewers});
            const newCampaign = await this.campaignService.findDetailsById(campaignId);

            res.status(200).json({newCampaign});
        } catch (error) {
            next(error);
        }
    }

    unshare = async(req,res,next) => {
        try {
            const campaignId = req.params.campaignId;
            const {editors, viewers} = req.body;

            await this.campaignService.deleteDetails({campaignId, editors, viewers});
            const newCampaign = await this.campaignService.findDetailsById(campaignId);

            res.status(200).json({newCampaign});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const {campaignId} = req.params;
            const {campaignName} = req.body;

            const updatedCampaign = await this.campaignService.update({campaignId,campaignName});
            res.status(200).json({updatedCampaign});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CampaignController();