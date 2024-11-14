
const db = require('../config/dbConfig');
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID;
const MANAGER_ROLE_ID = process.env.MANAGER_ROLE_ID;

class TeamService {

    constructor () {
        this.db = db;
    }

    async create({teamName,mainManagerId, members, managers}) {

        const teamIds = await this.db('teams').insert({team_name: teamName, main_manager_id: mainManagerId}).returning('team_id');
        const teamId = teamIds.at(0).team_id;

        await this.createDetail({teamId, members, managers});
        return {teamId, teamName, mainManagerId, managers, members}
    }

    async createDetail({teamId, members, managers}) {
        
        const memberRecords = members.map((memberId) => {
            return {user_id: memberId, team_id: teamId, role_id: MEMBER_ROLE_ID};
        });
        const managerRecords = managers.map((managerId) => {
            return {user_id: managerId, team_id: teamId, role_id: MANAGER_ROLE_ID};
        });

        const insertMembers = await this.db('team_details').insert(memberRecords).returning('*');
        const insertManagers = await this.db('team_details').insert(managerRecords).returning('*');

        return {'members': insertMembers, 'managers': insertManagers};
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
                            .whereIn('team_details.role_id', [MANAGER_ROLE_ID, MEMBER_ROLE_ID]);

        
        const allTeamInfo = new Map();

        users.forEach((user) => {
            const teamId =  user.team_id;
            const teamName = user.team_name;

            if(!allTeamInfo.has(teamId)) {
                allTeamInfo.set(teamId, {"teamName": teamName,"members": [], "managers": []});
            }
            
            const currentManagers = allTeamInfo.get(teamId).managers;
            const currentMembers = allTeamInfo.get(teamId).members;

            if(user.role_id == MANAGER_ROLE_ID) currentManagers.push({user_id: user.user_id, user_name: user.user_name});
            else currentMembers.push({user_id: user.user_id, user_name: user.user_name});
        });

        const allTeam = [];

        allTeamInfo.forEach((value,key) => {
            allTeam.push({team_id: key, team_name: value.teamName, members: value.members, managers: value.managers});
        });

        return allTeam;
    }

    async getTeam({teamId}) {
        const teams = await db('teams').select('team_name').where('team_id', teamId).first();
        // if(!teams) throw errorHandler(404, 'team not found');
        if(!teams) return {};

        const teamName = teams.team_name;
        const users = await db('team_details').join('teams','teams.team_id', 'team_details.team_id', )
                          .join('users', 'users.user_id', 'team_details.user_id')
                          .select('users.user_id', 'users.user_name','team_details.role_id',)
                          .where('team_details.team_id', teamId)
                          .whereIn('team_details.role_id', [MANAGER_ROLE_ID, MEMBER_ROLE_ID]);
        
        const managers = [], members = [];
        users.forEach((user) => {
            if(user.role_id == MANAGER_ROLE_ID) managers.push({user_id: user.user_id, user_name: user.user_name});
            if(user.role_id == MEMBER_ROLE_ID) members.push({user_id: user.user_id, user_name: user.user_name});
        });
        return {team_id: teamId, team_name: teamName, managers, members};
    }


    async addMembertoTeam({teamId, memberId}){
        await this.db('team_details').insert({team_id: teamId, user_id: memberId, role_id: MEMBER_ROLE_ID}).returning('*');
        return await this.getTeam({teamId});
    }

    async deleteMemberFromTeam({teamId, memberId}){
        await this.db('team_details').where({team_id: teamId, user_id: memberId}).delete();
        return await this.getTeam({teamId});
    }


    async addManagertoTeam({teamId, managerId}){
        await this.db('team_details').insert({team_id: teamId, user_id: managerId, role_id: MANAGER_ROLE_ID}).returning('*');
        return await this.getTeam({teamId});
    }

    async getMembersFromTeam({teamId}) {
        const members = await this.db('team_details').select('user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', teamId)
                               .where('team_details.role_id', MEMBER_ROLE_ID) ;

        const membeIds = members.map((member) => member.user_id);

        return membeIds;
    }

    async getManagersFromTeam({teamId}){
        const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', teamId)
                               .where('team_details.role_id', MANAGER_ROLE_ID);

        const managerIds = managers.map((manager) => manager.user_id);
        return managerIds;
    }

    async getMainManagerFromTeam({teamId}){

        const mainManagerId = await this.db('teams').select('main_manager_id').where('team_id', teamId).first();
    
        return mainManagerId.main_manager_id;
    }

    async upsert({teamId, managers, members}){
        const newTeamInfo = [];
        if(managers){
            managers.forEach((managerId) => {
                newTeamInfo.push({team_id: teamId, user_id: managerId, role_id: MANAGER_ROLE_ID});
            });
        }
        if(members){
            members.forEach((memberId) => {
                newTeamInfo.push({team_id: teamId, user_id: memberId, role_id: MEMBER_ROLE_ID});
            });
        }
        console.log(newTeamInfo);
        await this.db.transaction(async trx => {
            // delete all users from teamId
            await trx('team_details').where('team_id', teamId).delete();
            // insert new team back
            await trx('team_details').insert(newTeamInfo);
        });
        return await this.getTeam({teamId});
    }
}

module.exports = new TeamService();