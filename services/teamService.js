

const knex = require('knex');
const db = require('../config/dbConfig');
const { errorHandler } = require('../middleware/error');

class TeamService {

    constructor () {
        this.db = db;
    }

    async create(team_name) {
        // team: teamName -> teamId
        const team_id = await this.db('teams').insert({team_name}).returning('team_id');
        return team_id;
        // create details; teamId, userId, role_id
    }

    async getAll() {
        const teams = await this.db('teams').select('*').returning('*');
        return teams;
    }

    async getAllDetails (){
       const teamsRaw = await this.getAll();
       console.log(teamsRaw);

       const allTeams = await Promise.all(teamsRaw.map(async (team) => {
            const teamId =  team.team_id;

            const users = await db('team_details').join('teams','teams.team_id', 'team_details.team_id', )
                              .join('users', 'users.user_id', 'team_details.user_id')
                              .select('users.user_id', 'users.user_name','team_details.role_id')
                              .where('team_details.team_id', teamId)
                              .whereIn('team_details.role_id', [3, 4]);

            const managers = [], members = [];

            users.forEach((user) => {
                if(user.role_id == 3) managers.push({user_id: user.user_id, user_name: user.user_name});
                if(user.role_id == 4) members.push({user_id: user.user_id, user_name: user.user_name});
            });

            return {team_id: teamId, team_name: team.team_name, managers, members};
        }));
        return allTeams;
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

    async createDetail({main_manager_id, team_id,members,managers}) {

        const member_records = members.map((memberId) => {
            return {user_id: memberId, team_id, role_id: 4};
        });

        const manager_records = managers.map((managerId) => {
            return {user_id: managerId, team_id, role_id: 3};
        });

        const insertMainManger  = await this.db('team_details').insert({user_id: main_manager_id, team_id, role_id: 5}).returning('*');
        const insertMembers = await this.db('team_details').insert(member_records).returning('*');
        const insertManagers = await this.db('team_details').insert(manager_records).returning('*');

        return {'members': insertMembers, 'managers': insertManagers, 'main_manger': insertMainManger};
    }

    async addMembertoTeam({team_id, member_id}){
        await this.db('team_details').insert({team_id, user_id: member_id, role_id: 4}).returning('*');
        return await this.getTeam({teamId: team_id});
    }

    async deleteMemberFromTeam({team_id, member_id}){
        await this.db('team_details').where({team_id, user_id: member_id}).delete();
        return await this.getTeam({teamId: team_id});
    }


    async addManagertoTeam({team_id, manager_id}){
        await this.db('team_details').insert({team_id, user_id: manager_id, role_id: 3}).returning('*');
        return await this.getTeam({teamId: team_id});
    }

    async getMembersFromTeam({team_id}) {

        const members = await this.db('team_details').select('user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 4) ;

        const member_ids = members.map((member) => member.user_id);

        return member_ids;
    }

    async getManagersFromTeam({team_id}){

        const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 3) ;

        const manager_ids = managers.map((manager) => manager.user_id);
        return manager_ids;
    }

    async getMainManagerFromTeam({team_id}){
        try {
            const team = await this.getTeam({teamId: team_id});

            const managers = await this.db('team_details').select('users.user_id')
                               .join('users', 'users.user_id', 'team_details.user_id')
                               .where('team_details.team_id', team_id)
                               .where('team_details.role_id', 5) ;
            const main_manager_id = managers[0].user_id;

            return main_manager_id;
        } catch (error) {
            throw error;
        }
        
    }

    async upsert({team_id, managers, members}){

        const new_team_info = [];
        managers.forEach((manager_id) => {
            new_team_info.push({team_id, user_id: manager_id, role_id: 3});
        });
        members.forEach((member_id) => {
            new_team_info.push({team_id, user_id: member_id, role_id: 4});
        });
        
      const updatedUsers =  await this.db('team_details').insert(new_team_info).onConflict(['team_id', 'user_id']).merge();
      return await this.getTeam({teamId: team_id});

    }





}

module.exports = new TeamService();