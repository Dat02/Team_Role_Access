
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const { errorHandler } = require('../middleware/error');
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

            const {role_id, user_id} = req.user;

            const {teamName, members, managers} = req.body;
            const team_id = await (await this.teamService.create(teamName)).at(0).team_id;
            const result = await this.teamService.createDetail({main_manager_id: user_id,team_id, members, managers});

            res.status(200).json({team_id, team_name: teamName, members, managers});
        } catch (error) {
            next(error);   
        }
    }

    addMember =  async (req,res,next) => {
        try {
            const user_id =  req.user.user_id;
            // const user_id = 8;
            const team_id = req.params.teamId;

            const manager_ids = await this.teamService.getManagersFromTeam({team_id});

            if(! manager_ids.includes(user_id)) return next(errorHandler(403, 'only managers of this team can add member'));
            
            const member_id = req.body.memberId;
            const  new_member = await this.teamService.addMembertoTeam({team_id, member_id});

            res.status(200).json(new_member);
        } catch (error) {
            next(error);
        }
    }

    addManager = async (req,res,next) => {
        // only main manager can add other manager

        const {user_id} = req.user;
        const team_id = req.params.teamId;

        const main_manager_id = await this.teamService.getMainManagerFromTeam({team_id});
        
        if(user_id != main_manager_id) return next(errorHandler(403, 'only main manager can add other managers'));

        const manager_id = req.body.managerId;
        const new_manager  = await this.teamService.addManagertoTeam({team_id, manager_id});

        res.staus(200).json(new_manager);
    }

    deleteMember  = async (req,res,next) => {

        const team_id = req.params.teamId;
        const member_id = req.params.memberId;

        const user_id = req.user.user_id;

        const manager_ids = await this.teamService.getManagersFromTeam({team_id});
        if(! manager_ids.includes(user_id)) return next(errorHandler(403, 'only managers of this team can delete member'));

        const deleted_member = await this.teamService.deleteMemberFromTeam({team_id, member_id});

        res.status(200).json(deleted_member);

    }

    deleteManager  = async (req,res,next) => {

        const team_id = req.params.teamId;
        const manager_id = req.params.memberId;

        const user_id = req.user.user_id;

        const main_manager_id = await this.teamService.getMainManagerFromTeam({team_id});
        if(user_id != main_manager_id) return next(errorHandler(403, 'only main manager of this team can delete other managers'));

        const deleted_manager = await this.teamService.deleteMemberFromTeam({team_id, member_id: manager_id});
        
        res.status(200).json(deleted_manager);

    }

    updateTeam = async (req,res,next) => {

        const {user_id} = req.user;
        const team_id = req.params.teamId;

        const main_manager_id = await this.teamService.getMainManagerFromTeam({team_id});
        
        if(user_id != main_manager_id) return next(errorHandler(403, 'only main manager can add other managers'));

        const {managers , members} = req.body;

        await this.teamService.upsert({team_id, managers, members});
    }
    

}

module.exports = new TeamController();

