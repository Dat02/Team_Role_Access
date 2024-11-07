
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const { errorHandler } = require('../middleware/error');
const TeamService = require('../services/teamService');

class TeamController {

    constructor () {
        this.teamService = TeamService;
    }

    create = async (req,res,next) => {
        try {

            const {role_id, user_id} = req.user;
            console.log(role_id, user_id);

            const {teamName, members, managers} = req.body;
            const teamId = await (await this.teamService.create(teamName)).at(0).team_id;
            const result = await this.teamService.createDetail({main_manager_id: user_id, team_id: teamId, members, managers});

            res.status(200).json(result);
        } catch (error) {
            next(error);   
        }
    }

    addMember =  async (req,res,next) => {
        try {
            const user_id =  req.user.user_id;
            // const user_id = 8;
            const team_id = req.params.teamId;

            const managerIds = await this.teamService.getManagersFromTeam({team_id});
            console.log(managerIds, user_id);
            if(! managerIds.includes(user_id)) return next(errorHandler(403, 'only managers of this team can add member'));
            
            const member_id = req.body.memberId;
            const newMember = await this.teamService.addMembertoTeam({team_id, member_id});

            res.status(200).json(newMember);
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
        const newManager  = await this.teamService.addManagertoTeam({team_id, manager_id});

        res.staus(200).json(newManager);
    }

    deleteMember  = async (req,res,next) => {

        const team_id = req.params.teamId;
        const member_id = req.params.memberId;

        const user_id = req.user.user_id;

        const managerIds = await this.teamService.getManagersFromTeam({team_id});
        if(! managerIds.includes(user_id)) return next(errorHandler(403, 'only managers of this team can delete member'));

        const deletedMember = await this.teamService.deleteMemberFromTeam({team_id, member_id});

        res.status(200).json(deletedMember);

    }

    deleteManager  = async (req,res,next) => {

        const team_id = req.params.teamId;
        const manager_id = req.params.memberId;

        const user_id = req.user.user_id;

        const main_manager_id = await this.teamService.getMainManagerFromTeam({team_id});
        if(user_id != main_manager_id) return next(errorHandler(403, 'only main manager of this team can delete other managers'));

        const deletedManager = await this.teamService.deleteMemberFromTeam({team_id, member_id: manager_id});
        
        res.status(200).json(deletedManager);

    }

}

module.exports = new TeamController();

