


const db = require('../config/dbConfig');
const { errorHandler } = require('../middleware/error');

class TeamService {

    constructor () {
        this.db = db;
    }

    async create(teamName) {
        // team: teamName -> teamId
        const team_id = await this.db('teams').insert({team_name: teamName}).returning('team_id');
        return team_id;
        // create details; teamId, userId, role_id
    }

    async createDetail({main_manager_id, team_id,members,managers}) {

        const memberRecords = members.map((memberId) => {
            return {user_id: memberId, team_id, role_id: 4};
        });

        const managerRecords = managers.map((managerId) => {
            return {user_id: managerId, team_id, role_id: 3};
        });

        const insertMainManger  = await this.db('team_details').insert({user_id: main_manager_id, team_id, role_id: 5}).returning('*');
        const insertMembers = await this.db('team_details').insert(memberRecords).returning('*');
        const insertManagers = await this.db('team_details').insert(managerRecords).returning('*');

        return {'members': insertMembers, 'managers': insertManagers, 'main_manger': insertMainManger};
    }

    async addMembertoTeam({team_id, member_id}){
        const insertMember = await this.db('team_details').insert({team_id, user_id: member_id, role_id: 4}).returning('*');
        return insertMember;
    }

    async deleteMemberFromTeam({team_id, member_id}){
        const deletedMember = await this.db('team_details').where({team_id, user_id: member_id}).delete();
        return deletedMember;
    }


    async addManagertoTeam({team_id, manager_id}){
        const insertManager = await this.db('team_details').insert({team_id, user_id: manager_id, role_id: 3}).returning('*');
        return insertManager;
    }

    async getMembersFromTeam({team_id}) {

        const members = await this.db('team_details').select('user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 4) ;

        const memberIds = members.map((member) => member.user_id);

        return memberIds;
    }

    async getManagersFromTeam({team_id}){

        const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 3) ;

        const managerIds = managers.map((manager) => manager.user_id);
        return managerIds;
    }

    async getMainManagerFromTeam({team_id}){

        const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 5) ;

        const mainManagerId = managers.at(0).user_id;

        return mainManagerId;
    }





}

module.exports = new TeamService();