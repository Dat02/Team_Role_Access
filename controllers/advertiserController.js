const { errorHandler } = require('../helpers/errorHandler');
const advertiserService = require('../services/advertiserService');

class AdvertiserController {
    constructor() {
        this.advertiserService = advertiserService;
    }

    getAllAccessAdvertiser = async (req,res,next) => {
        try {
            const userId = req.user.user_id;
            const advertisers = await this.advertiserService.findAllAccess(userId);
            res.status(200).json({advertisers});
        } catch (error) {
           next(error); 
        }
        
    }

    getAllDetails = async (req,res,next) => {
        try {
            const allAdvertisers = await this.advertiserService.findAllDetails();
            res.status(200).json({allAdvertisers});
        } catch (error) {
            next(error);
        }
    }

    getOne = async (req,res,next) => {
        try {
            const {advertiserId} = req.params;
            const advertiser = await this.advertiserService.findbyId(advertiserId);
            res.status(200).json(advertiser);
        } catch (error) {
            next(error);
        }
    }

    getOneDetail = async (req,res,next) => {
        try {
            const {advertiserId} = req.params;
            const advertisers = await this.advertiserService.findDetailsById(advertiserId);
            res.status(200).json(advertisers);
        } catch (error) {
            next(error);
        }
    }

    create = async (req,res,next) => {
        try {
            const {advertiserName, branchName, website, editors, viewers} = req.body;
            const ownerId = req.user.user_id;
            const newAdvertiser = await this.advertiserService.save({advertiserName,branchName,website,ownerId, editors, viewers});

            res.status(200).json({...newAdvertiser, editors, viewers});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const {advertiserId} = req.params;
            const {advertiserName, branchName, website} = req.body;

            const updatedAdvertiser = await this.advertiserService.update({advertiserId,advertiserName,branchName,website});
            res.status(200).json({updatedAdvertiser});
        } catch (error) {
            next(error);
        }
    }
    

    share = async (req,res,next) => {
        try {
            const advertiserId = req.params.advertiserId;
            const {editors, viewers} = req.body;

            await this.advertiserService.saveDetails({advertiserId, editors, viewers});
            const newAdvertiser = await this.advertiserService.findDetailsById(advertiserId);

            res.status(200).json({newAdvertiser});
        } catch (error) {
            next(error);
        }
    }

    unshare = async (req,res,next) => {
        try {
            const advertiserId = req.params.advertiserId;
            const {editors, viewers} = req.body;

            await this.advertiserService.deleteDetails({advertiserId, editors, viewers});
            const newAdvertiser = await this.advertiserService.findDetailsById(advertiserId);

            res.status(200).json({newAdvertiser});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdvertiserController();