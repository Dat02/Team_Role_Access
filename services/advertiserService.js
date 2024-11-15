const knex = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');
const campaignService = require('./campaignService');
const editor_role_id = process.env.EDITOR_ROLE_ID;
const viewer_role_id = process.env.VIEWER_ROLE_ID;

class AdvertiserService {

    constructor() {
        this.db = knex;
        this.campaignService = campaignService;
    }

    findAll = async () => {
        try {
            return await this.db('advertisers').select('*');
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findAllDetails = async () => {
        try {
            const records = await this.db('advertiser_details')
                                        .fullOuterJoin('advertisers', 'advertiser_details.advertiser_id', 'advertisers.advertiser_id')
                                        .leftJoin('users', 'advertiser_details.user_id', 'users.user_id')
                                        .select('advertisers.*',
                                                'advertiser_details.advertiser_id as ad_details_id',
                                                'advertiser_details.role_id',
                                                'advertiser_details.user_id as ad_details_user_id',
                                                'users.user_id',
                                                'users.role_id as user_role_id',
                                                'users.user_name',
                                        )

            const adMap = new Map();
            const roleMap  = new Map();

            records.forEach( (record) => {
                const advertiserId = record.advertiser_id;
                if(!adMap.has(advertiserId)) {
                    adMap.set(advertiserId, {advertiser_name: record.advertiser_name, branch_name: record.branch_name});
                    roleMap.set(advertiserId, {"editors": [], "viewers": []});
                } 
                const currentEditors = roleMap.get(advertiserId).editors;
                const currentViewers = roleMap.get(advertiserId).viewers;

                if(record.role_id == editor_role_id) currentEditors.push({user_name: record.user_name, user_id: record.user_id});
                if(record.role_id == viewer_role_id) currentViewers.push({user_name: record.user_name, user_id: record.user_id});
            });

            const allAdvertiser = [];
            adMap.forEach( (value, key) => {
                allAdvertiser.push({advertiser_id: key, ...value, editors: roleMap.get(key).editors, viewers: roleMap.get(key).viewers});
            });

            return allAdvertiser;

        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findbyId = async (advertiserId) => {
        try {
            return await this.db('advertisers')
                                .select('*')
                                .where('advertiser_id',advertiserId)
                                .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findDetailsById = async (advertiserId) => {
        try {
            const advertiserInfo = await this.findbyId(advertiserId);
            const usersInAdvertiser = await this.db('advertiser_details')
                                                .join('users', 'advertiser_details.user_id', 'users.user_id')
                                                .select('advertiser_details.*',
                                                        'users.role_id as user_role_id',
                                                        'users.user_name'
                                                )
                                                .where('advertiser_details.advertiser_id', advertiserId);


            const editors = [], viewers = [];
            usersInAdvertiser.forEach((user) => {
                if(user.role_id == editor_role_id) editors.push({user_id: user.user_id, user_name: user.user_name});
                if(user.role_id == viewer_role_id) viewers.push({user_id: user.user_id, user_name: user.user_name});
            });

            return {...advertiserInfo, editors, viewers};
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    save = async (advertiser) => {
        try {
            const {advertiserName, branchName, website, ownerId, editors, viewers} = advertiser;

            const advertiserToInsert = 
            {advertiser_name: advertiserName,branch_name: branchName, website, owner_id: ownerId};
            
            const newAdvertiser =  await this.db('advertisers').insert(advertiserToInsert).returning('*');
            await this.saveDetails({advertiserId: newAdvertiser[0].advertiser_id, editors, viewers});

            return newAdvertiser[0];

        } catch (error) {
            throw errorHandler(503, error.message);
        } 
    }

    saveDetails = async ({advertiserId, editors, viewers}) => {
        try {
            const editorRecords = editors.map((editorId) => {
            return {user_id: editorId, advertiser_id: advertiserId, role_id: editor_role_id};
            });
            const viewerRecords = viewers.map((viewerId) => {
                return {user_id: viewerId, advertiser_id: advertiserId, role_id: viewer_role_id};
            });

            const inserRecords = [...editorRecords,...viewerRecords];
            if(inserRecords.length > 0) await this.db('advertiser_details').insert(inserRecords);

        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteDetails = async ({advertiserId, editors, viewers}) => {
        try {
            await this.db.transaction(async (trx) => {
                // delete editor permission
                await trx('advertiser_details')
                        .where('advertiser_id', advertiserId)
                        .where('role_id', editor_role_id)
                        .whereIn('user_id', editors)
                        .delete();
                // delete viewer permission
                await trx('advertiser_details')
                        .where('advertiser_id', advertiserId)
                        .where('role_id', viewer_role_id)
                        .whereIn('user_id', viewers)
                        .delete();
            });
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findOwnerById = async (advertiserId) => {
        try {
            const owner = await this.db('advertisers')
                                .select('owner_id')
                                .where('advertiser_id', advertiserId)
                                .first();
                                
            return owner ? owner.owner_id : null;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findEditorsById = async (advertiserId) => {
        try {
            const editors = await this.db('advertiser_details')
                                        .select('user_id')
                                        .where('advertiser_id', advertiserId)
                                        .where('role_id', editor_role_id);
            
            return editors.map((editor) => editor.user_id);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findViewersById = async (advertiserId) => {
        try {
            const viewers = await this.db('advertiser_details')
                                        .select('user_id')
                                        .where('advertiser_id', advertiserId)
                                        .where('role_id', viewer_role_id);
            
            return viewers.map((viewer) => viewer.user_id);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findAllCampaignFromAdvertiser = async (advertiserId) => {
        try {
            const campaignIdRecords = await this.db('campaigns')
                                        .select('campaign_id')
                                        .where('advertiser_id', advertiserId);
            
            const campaignIds = campaignIdRecords.map((campaignIdRecord) => campaignIdRecord.campaign_id);
            return campaignIds;         
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    update = async (advertiser) => {
        try {
            const {advertiserId, advertiserName, branchName, website} = advertiser;
            const newRecord = {};
            if(advertiserName) newRecord.advertiser_name = advertiserName;
            if(branchName) newRecord.branch_name = branchName;
            if(website) newRecord.website = website;
            newRecord.updated_at = new Date();

            await this.db('advertisers')
                        .where('advertiser_id', advertiserId)
                        .update(newRecord);
            
            return await this.findbyId(advertiserId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }




}

module.exports = new AdvertiserService();