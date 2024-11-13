
const db = require('../config/dbConfig');
const { errorHandler } = require('../middleware/error');


class TeamService {

    constructor () {
        this.db = db;
    }

    async create(teamName) {
        // team: teamName -> teamId
        const teamId = await this.db('teams').insert({teamName}).returning('team_id');
        return teamId;
    }

    async getAll() {
        const teams = await this.db('teams').select('*').returning('*');
        return teams;
    }

    async getAllDetails (){

        const users = await db('team_details')
                            .join('teams','teams.team_id', 'team_details.team_id', )
                            .join('users', 'users.user_id', 'team_details.user_id')
                            .select('users.user_id','team_details.team_id','teams.team_name', 'users.user_name','team_details.role_id')
                            .whereIn('team_details.role_id', [3, 4]);

        
        const allTeamInfo = new Map();

        users.forEach((user) => {
            const teamId =  user.team_id;
            const teamName = user.team_name;

            if(!allTeamInfo.has(teamId)) {
                allTeamInfo.set(teamId, {"teamName": teamName,"members": [], "managers": []});
            }
            
            const currentManagers = allTeamInfo.get(teamId).managers;
            const currentMembers = allTeamInfo.get(teamId).members;

            if(user.role_id == 3) currentManagers.push({user_id: user.user_id, user_name: user.user_name});
            else currentMembers.push({user_id: user.user_id, user_name: user.user_name});
        });

        const allTeam = [];

        allTeamInfo.forEach((value,key) => {
            allTeam.push({team_id: key, team_name: value.teamName, members: value.members, managers: value.managers});
        });

        return allTeam;

    }

    async getTeam({teamId}) {
        try {
            const teams = await db('teams').select('team_name').where('team_id', teamId).first();
            if(!teams) throw errorHandler(404, 'team not found');

            const teamName = teams.team_name;

            const users = await db('team_details').join('teams','teams.team_id', 'team_details.team_id', )
                              .join('users', 'users.user_id', 'team_details.user_id')
                              .select('users.user_id', 'users.user_name','team_details.role_id',)
                              .where('team_details.team_id', teamId)
                              .whereIn('team_details.role_id', [3, 4]);

            const managers = [], members = [];

            users.forEach((user) => {
                if(user.role_id == 3) managers.push({user_id: user.user_id, user_name: user.user_name});
                if(user.role_id == 4) members.push({user_id: user.user_id, user_name: user.user_name});
            });

            return {team_id: teamId, team_name: teamName, managers, members};
        } catch (error) {
            throw error;
        }
        
    }

    async createDetail({mainManagerId, teamId, members, managers}) {
        const memberRecords = members.map((memberId) => {
            return {user_id: memberId, team_id: teamId, role_id: 4};
        });
        const managerRecords = managers.map((managerId) => {
            return {user_id: managerId, team_id: teamId, role_id: 3};
        });
        const insertMainManger  = await this.db('team_details').insert({user_id: mainManagerId, team_id: teamId, role_id: 5}).returning('*');
        const insertMembers = await this.db('team_details').insert(memberRecords).returning('*');
        const insertManagers = await this.db('team_details').insert(managerRecords).returning('*');
        return {'members': insertMembers, 'managers': insertManagers, 'main_manger': insertMainManger};
    }

    async addMembertoTeam({teamId, memberId}){
        await this.db('team_details').insert({team_id: teamId, user_id: memberId, role_id: 4}).returning('*');
        return await this.getTeam({teamId});
    }

    async deleteMemberFromTeam({teamId, memberId}){
        await this.db('team_details').where({team_id: teamId, user_id: memberId}).delete();
        return await this.getTeam({teamId});
    }


    async addManagertoTeam({teamId, managerId}){
        await this.db('team_details').insert({team_id: teamId, user_id: managerId, role_id: 3}).returning('*');
        return await this.getTeam({teamId});
    }

    async getMembersFromTeam({teamId}) {

        const members = await this.db('team_details').select('user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', teamId)
                               .where('team_details.role_id', 4) ;

        const membeIds = members.map((member) => member.user_id);

        return membeIds;
    }

    async getManagersFromTeam({teamId}){
        const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', teamId)
                               .where('team_details.role_id', 3);
        const managerIds = managers.map((manager) => manager.user_id);
        return managerIds;
    }

    async getMainManagerFromTeam({teamId}){
        try {

            const main_manager_id = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', teamId)
                               .where('team_details.role_id', 5).first();

            return main_manager_id ? main_manager_id.user_id : undefined ;
        } catch (error) {
            throw error;
        }
        
    }

    async upsert({teamId, managers, members}){

        try {

            const newTeamInfo = [];

            if(managers){
                managers.forEach((managerId) => {
                    newTeamInfo.push({teamId, user_id: managerId, role_id: 3});
                });
            }

            if(members){
                members.forEach((memberId) => {
                    newTeamInfo.push({teamId, user_id: memberId, role_id: 4});
                });
            }

            console.log(newTeamInfo);

            await this.db.transaction(async trx => {

                // delete all users from teamId
                await trx('team_details').where({teamId}).whereNotIn('role_id', [5]).delete();
                // insert it again
                await trx('team_details').insert(newTeamInfo);

            });

            return await this.getTeam({teamId});
        } catch (error) {
            console.log(error);
        }
        
    }
}

module.exports = new TeamService();