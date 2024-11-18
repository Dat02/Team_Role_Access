
const { errorHandler } = require('../helpers/errorHandler');
const TeamService = require('../services/teamService');

class TeamController {

    constructor () {
        this.teamService = TeamService;
    }

    getAll = async (req,res,next) => {
        try {
            const teams = await this.teamService.getAll();
            res.status(200).json(teams);
        } catch (error) {
            next(error);
        }
    }

    getAllDetails  = async (req,res,next) => {
        try {
            const allTeams = await this.teamService.getAllDetails();
            res.status(200).json(allTeams);
        } catch (error) {
            next(error);
        }
    }

    getTeam = async (req,res,next) => {
        try {
            
            const teamId  = req.params.teamId;
            const team = await this.teamService.getTeam({teamId});
            res.status(200).json(team);
        } catch (error) {
            next(error);
        }
    }

    create = async (req,res,next) => {
        try {
            const {user_id} = req.user;
            const {teamName, members, managers} = req.body;
            const result = await this.teamService.create({teamName, mainManagerId: user_id, members, managers});
            res.status(200).json(result);
        } catch (error) {
            next(error);   
        }
    }

    addMember =  async (req,res,next) => {
        try {
            const user_id =  req.user.user_id;
            const teamId = req.params.teamId;

            const managerIds = await this.teamService.getManagersFromTeam({teamId});

            if(! managerIds.includes(user_id)) return next(errorHandler(403, 'only managers of this team can add member'));
            
            const memberId = req.body.memberId;
            const  updatedTeam = await this.teamService.addMembertoTeam({teamId, memberId});

            res.status(200).json({updatedTeam});
        } catch (error) {
            next(error);
        }
    }

    addManager = async (req,res,next) => {
        // only main manager can add other manager
        try {
            const userId = req.user.user_id;
            const teamId = req.params.teamId;

            const mainManagerId = await this.teamService.getMainManagerFromTeam({teamId});
            
            if(userId != mainManagerId) return next(errorHandler(403, 'only main manager can add other managers'));

            const managerId = req.body.managerId;
            const updatedTeam  = await this.teamService.addManagertoTeam({teamId, managerId});

            res.status(200).json({updatedTeam});
        } catch (error) {
            next(error);
        }
    }

    deleteMember  = async (req,res,next) => {
        try {
            const teamId = req.params.teamId;
            const memberId = req.params.memberId;

            const userId = req.user.user_id;

            const manager_ids = await this.teamService.getManagersFromTeam({teamId});
            if(! manager_ids.includes(userId)) return next(errorHandler(403, 'only managers of this team can delete member'));

            const updatedTeam = await this.teamService.deleteMemberFromTeam({teamId, memberId});

            res.status(200).json({updatedTeam});
        } catch (error) {
            next(error);
        }

    }

    deleteManager  = async (req,res,next) => {
        try {
            const teamId = req.params.teamId;
            const managerId = req.params.managerId;

            const userId = req.user.user_id;

            const mainManagerId = await this.teamService.getMainManagerFromTeam({teamId});
            // console.log(mainManagerId);
            if(userId != mainManagerId) return next(errorHandler(403, 'only main manager of this team can delete other managers'));

            const updatedTeam = await this.teamService.deleteManagerFromTeam({teamId, memberId: managerId});
            
            res.status(200).json({updatedTeam});
        } catch (error) {
            next(error);
        }
    }

    updateTeam = async (req,res,next) => {
        try {
            const userId = req.user.user_id;
            const teamId = req.params.teamId;

            const mainManagerId = await this.teamService.getMainManagerFromTeam({teamId});

            if(userId != mainManagerId) return next(errorHandler(403, 'only main manager can add other managers'));

            const {managers , members} = req.body;
            const updatedUsers = await this.teamService.upsert({teamId, managers, members});

            res.status(200).json(updatedUsers);
        } catch (error) {
            next(error);
        }
    }

    // test controller
    getRecursive = async (req,res,next) => {
        try {
            const userId = req.user.user_id;
            const allManager = await this.teamService.findMyMembers(userId);
            res.status(200).json(allManager);
        } catch (error) {
            next(error);
        }
    }
    
}

module.exports = new TeamController();

