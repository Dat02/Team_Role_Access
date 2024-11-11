

const { body, param } = require('express-validator');

const getTeamRule = [
  
  param('teamId')
    .isInt()
    .withMessage('team ID must be an integer'),

];


module.exports = {getTeamRule}