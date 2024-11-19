const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe } = require('mocha');
const { expect } = chai;
const app = require('../server');
const userController = require('../controllers/userController');

chai.use(chaiHttp);

describe('GET /users', () => {
    it('should return all users', async() => {
        
        const res = await userController.getAllUser();
        expect(res.status).to.equal(200);
        // expect(res.body).is.null;/
    });
});