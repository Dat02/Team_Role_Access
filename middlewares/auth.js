
const {errorHandler} = require('../helpers/errorHandler');
const jwt = require('jsonwebtoken');
const teamService = require('../services/teamService');
const advertiserService = require('../services/advertiserService');
const campaignService = require('../services/campaignService');


const verifyToken = (req,res,next) => {
    
    const token = req.cookies.jwt;
    if(!token) return next(errorHandler(401, 'token not found'));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is not valid'));
        req.user = user;
        next();
    })
}

const checkRole = (assign) => {
    return (req,res,next) => {
        const role = req.user.role_id;
        if(!role) return next(errorHandler(401, 'cant find your role'));
        if(role != assign) return next(errorHandler(404, 'your role can not do this action'));
        next();
    }
}

const isCampaignViewer = async (req,res,next) => {
    const userId = req.user.user_id;
    const {campaignId} = req.params;

    const editors = await campaignService.findEditorsById(campaignId);
    const viewers = await campaignService.findViewersById(campaignId);

    const advertiserId = await campaignService.findAvertiserbyId(campaignId);
    const owner = await advertiserService.findOwnerById(advertiserId);

    const advertiserEditors = await advertiserService.findEditorsById(advertiserId);
    const advertiserViewers = await advertiserService.findViewersById(advertiserId);
    console.log(advertiserViewers);

    const editorAndViewerMangers = await teamService.getAllManagerFromMembers([...advertiserEditors, ...advertiserViewers, owner]);
    const allViewrAccepted = [...editors, ...viewers, ...advertiserEditors, ...advertiserViewers,...editorAndViewerMangers, owner];

    if(!allViewrAccepted.includes(userId)) return next(errorHandler(403, 'not the campagin viewer'));

    next();
}

const isCampaignEditor = async (req,res,next) => {
    const userId = req.user.user_id;
    const {campaignId} = req.params;

    const editors = await campaignService.findEditorsById(campaignId);

    const advertiserId = await campaignService.findAvertiserbyId(campaignId);

    const owner = await advertiserService.findOwnerById(advertiserId);
    const advertiserEditors = await advertiserService.findEditorsById(advertiserId);
    const editorMangers = await teamService.getAllManagerFromMembers([...advertiserEditors, owner]);

    const allEditorAccepted = [...editors, ...advertiserEditors, ...editorMangers, owner];

    if(!allEditorAccepted.includes(userId)) return next(errorHandler(403, 'not the campaign editor'));

    next();
}

const isAdvertiserViewer = async (req,res,next) => {
    const userId = req.user.user_id;
    const {advertiserId} = req.params;

    const owner = await advertiserService.findOwnerById(advertiserId);
    const editors = await advertiserService.findEditorsById(advertiserId);
    const viewers = await advertiserService.findViewersById(advertiserId);
    const viwerManagers = await teamService.getAllManagerFromMembers([...editors, ...viewers, owner]);

    const allViewerAccepted = [...editors, ...viewers, ...viwerManagers, owner];
    if(!allViewerAccepted.includes(userId)) return next(errorHandler(403, 'not the advertiser viwers'));

    next();
}

const isAdvertiserEditor = async (req,res,next) => {
    const userId = req.user.user_id;
    const {advertiserId} = req.params;

    const owner = await advertiserService.findOwnerById(advertiserId);

    const editors = await advertiserService.findEditorsById(advertiserId);
    const editorManagers = await teamService.getAllManagerFromMembers([...editors,owner]);

    const allEditorAccepted = [...editors, ...editorManagers, owner];
    console.log(allEditorAccepted);
    if(!allEditorAccepted.includes(userId)) return next(errorHandler(403, 'not the advertiser editors'));

    next();
}

const isAdvertiserOwner = async (req,res,next) => {
    const userId = req.user.user_id;
    const {advertiserId} = req.params;

    const owner = await advertiserService.findOwnerById(advertiserId);
    if(userId != owner) return next(errorHandler(403, 'not the advertiser owner'));

    next();
}

module.exports = {verifyToken, checkRole, isAdvertiserEditor, isAdvertiserOwner, isCampaignEditor, isCampaignViewer, isAdvertiserViewer};