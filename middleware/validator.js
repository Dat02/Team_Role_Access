const { check } = require("express-validator");
const { body, param, validationResult } = require('express-validator');


const addTeamValidator = [
    check('teamId', 'The teamId is required.').not().isEmpty(),
    check('post_id', 'The post_id is required.').not().isEmpty(),
]