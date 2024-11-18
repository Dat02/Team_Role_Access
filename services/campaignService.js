const knex = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');
const editor_role_id = process.env.EDITOR_ROLE_ID;
const viewer_role_id = process.env.VIEWER_ROLE_ID;
const teamService = require('./teamService');

class CampaignService {

    constructor() {
        this.db = knex;
    }

    findAll = async () => {
        try {
            return await this.db('campaigns').select('*');
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findAllAccess = async (userId) => {
        try {
            const managers = await teamService.findMyMembers(userId);
            const users = [...managers, userId];
            const campaigns = await this.findCampaignsByUserIds(users);
            return campaigns;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findCampaignsByUserIds = async (users) => {
        try {
            const campaigns = await this.db('campaigns')
                                    .leftJoin('campaign_details', 'campaigns.campaign_id', 'campaign_details.campaign_id')
                                    .leftJoin('advertiser_details', 'campaigns.advertiser_id', 'advertiser_details.advertiser_id')
                                    .leftJoin('advertisers', 'campaigns.advertiser_id','advertisers.advertiser_id')
                                    .select('campaigns.*')
                                    .whereIn('advertiser_details.user_id', users)
                                    .orWhereIn('campaign_details.user_id',users)
                                    .orWhereIn('advertisers.owner_id', users)
                                    .distinct();


            return campaigns;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findAllDetails = async () => {
        try {
            const records = await this.db('campaign_details')
                                        .fullOuterJoin('campaigns', 'campaign_details.campaign_id', 'campaigns.campaign_id')
                                        .leftJoin('users', 'campaign_details.user_id', 'users.user_id')
                                        .select(
                                            'campaigns.*',
                                            'campaign_details.campaign_id as cam_details_id',
                                            'campaign_details.role_id',
                                            'users.role_id as user_role_id',
                                            'users.user_name',
                                            'users.user_id'
                                        );

            const adMap = new Map();
            const roleMap  = new Map();

            records.forEach( (record) => {
                const campaignId = record.campaign_id;
                if(!adMap.has(campaignId)) {
                    adMap.set(campaignId, {campaign_name: record.campaign_name, advertiser_id: record.advertiser_id});
                    roleMap.set(campaignId, {"editors": [], "viewers": []});
                } 
                const currentEditors = roleMap.get(campaignId).editors;
                const currentViewers = roleMap.get(campaignId).viewers;

                if(record.role_id == editor_role_id) currentEditors.push({user_name: record.user_name, user_id: record.user_id});
                if(record.role_id == viewer_role_id) currentViewers.push({user_name: record.user_name, user_id: record.user_id});
            });

            const allCampaign = [];
            adMap.forEach( (value, key) => {
                allCampaign.push({campaign_id: key, ...value, editors: roleMap.get(key).editors, viewers: roleMap.get(key).viewers});
            });

            return allCampaign;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findbyId = async (campaignId) => {
        try {
            return await this.db('campaigns')
                                .select('*')
                                .where('campaign_id',campaignId)
                                .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findDetailsById = async (campaignId) => {
        try {
            const campaignInfo = await this.findbyId(campaignId);
            const usersInCampaign = await this.db('campaign_details')
                                                .join('users', 'campaign_details.user_id', 'users.user_id')
                                                .select('campaign_details.*',
                                                        'users.role_id as user_role_id',
                                                        'users.user_name'
                                                )
                                                .where('campaign_details.campaign_id', campaignId);


            const editors = [], viewers = [];
            usersInCampaign.forEach((user) => {
                if(user.role_id == editor_role_id) editors.push({user_id: user.user_id, user_name: user.user_name});
                if(user.role_id == viewer_role_id) viewers.push({user_id: user.user_id, user_name: user.user_name});
            });

            return {...campaignInfo, editors, viewers};
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    save = async (campaign) => {
        try {
            const {campaignName, startDate, endDate, advertiserId, createdBy, editors, viewers} = campaign;

            const campaignToInsert = 
            {campaign_name: campaignName, start_date: startDate, end_date: endDate, advertiser_id: advertiserId, created_by: createdBy};
            
            const newCampaigns =  await this.db('campaigns').insert(campaignToInsert).returning('*');
            await this.saveDetails({campaignId: newCampaigns[0].campaign_id, editors, viewers});

            return newCampaigns[0];
        } catch (error) {
            throw errorHandler(503, error.message);
        } 
    }

    saveDetails = async ({campaignId, editors, viewers}) => {
        try {
            if(!editors) editors = [];
            if(!viewers) viewers = [];

            const editorRecords = editors.map((editorId) => {
                return {user_id: editorId, campaign_id: campaignId, role_id: editor_role_id};
            });
            const viewerRecords = viewers.map((viewerId) => {
                return {user_id: viewerId, campaign_id: campaignId, role_id: viewer_role_id};
            });

            const inserRecords = [...editorRecords,...viewerRecords];
            if(inserRecords.length > 0) await this.db('campaign_details').insert(inserRecords);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteDetails = async ({campaignId, editors, viewers}) => {
        try {
            if(!editors) editors = [];
            if(!viewers) viewers = [];
            await this.db.transaction(async (trx) => {
                // delete editor permission
                await trx('campaign_details')
                        .where('campaign_id', campaignId)
                        .where('role_id', editor_role_id)
                        .whereIn('user_id', editors)
                        .delete();
                // delete viewer permission
                await trx('campaign_details')
                        .where('campaign_id', campaignId)
                        .where('role_id', viewer_role_id)
                        .whereIn('user_id', viewers)
                        .delete();
            });
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    findEditorsById = async (campaignId) => {
        try {
            const editors = await this.db('campaign_details')
                                        .select('user_id')
                                        .where('campaign_id', campaignId)
                                        .where('role_id', editor_role_id);
            
            return editors.map((editor) => editor.user_id);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findViewersById = async (campaignId) => {
        try {
            const viewers = await this.db('campaign_details')
                                        .select('user_id')
                                        .where('campaign_id', campaignId)
                                        .where('role_id', viewer_role_id);
            
            return viewers;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findAvertiserbyId = async (campaignId) => {
        try {
            const record = await this.db('campaigns')
                                        .select('advertiser_id')
                                        .where('campaign_id', campaignId)
                                        .first();

            return record? record.advertiser_id: null;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    update = async (campaign) => {
        try {
            const {campaignId, campaignName} = campaign;
            const newRecord = {};
            if(campaignName) newRecord.campaign_name = campaignName;

            await this.db('campaigns')
                        .where('campaign_id', campaignId)
                        .update(newRecord);
            
            return await this.findbyId(campaignId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


}

module.exports = new CampaignService();