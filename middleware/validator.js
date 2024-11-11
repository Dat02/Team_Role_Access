

const { body, param } = require('express-validator');

const getTeamRule = [

param('teamId')
    .isInt()
    .withMessage('team ID must be an integer'),

param('memberId')
    .isInt() 
    .withMessage('member Id must be an integer'),

param('managerId')
    .isInt()
    .withMessage('manager ID must be an integer')

];






module.exports = {getTeamRule}