const { body, param } = require('express-validator');


const getTeamRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer')
];

const addMemberRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer'),

    body('memberId')
        .notEmpty().withMessage('member ID is required')
        .isInt().withMessage('member ID must be an integer')
];

const addManagerRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer'),

    body('managerId')
        .notEmpty().withMessage('member ID is required')
        .isInt().withMessage('member ID must be an integer')
];

const deleteManagerRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer'),

    param('managerId')
        .isInt().withMessage('Deleted Manager ID must be an integer'),

];


const deleteMemberRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer'),

    param('memberId')
        .isInt().withMessage('Deleted Manager ID must be an integer'),

];

const createTeamRule = [
    body('teamName')
        .notEmpty().withMessage('team name is required')
        .isString().withMessage('team name must be a string'),

    body('members') 
        .isArray().withMessage('members must be an array'),
    
    body('members.*')
        .toInt()
        .isInt().withMessage('member ID added must be an integer'),

    body('managers') 
        .isArray().withMessage('managers must be an array'),
    
    body('managers.*')
        .toInt()
        .isInt().withMessage('manager ID added must be an integer')

];

const updateTeamRule = [
    param('teamId')
        .isInt().withMessage('team ID must be an integer'),

    body('members') 
        .isArray().withMessage('members must be an array'),
    
    body('members.*')
        .toInt()
        .isInt().withMessage('member ID added must be an integer'),

    body('managers') 
        .isArray().withMessage('managers must be an array'),
    
    body('managers.*')
        .toInt()
        .isInt().withMessage('manager ID added must be an integer')
    
];

const getUserRule = [
    param('userId')
        .isInt().withMessage('userId must be an integer')
];


const registerUserRule = [
    body('username')
        .isString().withMessage('username must be a string'),
    body('email')
        .isEmail().withMessage('email filed is not valid'),
    body('password')
        .isString().withMessage('password must be a string'),
    body('roleId')
        .isInt().withMessage('role id must be an integer')
];

const loginUserRule = [
    body('email')
        .isEmail().withMessage('email filed is not valid'),
    body('password')
        .isString().withMessage('password must be a string')
];

const getListUserRule = [
    body('userIds')
        .isArray().withMessage('user ids must be an array'),
    body('userIds.*')
        .isInt().withMessage('each user id must be an id')
];


module.exports = {  getTeamRule, createTeamRule, addMemberRule, deleteMemberRule,deleteManagerRule,addManagerRule,
                    updateTeamRule, getUserRule, registerUserRule, loginUserRule, getListUserRule   } 