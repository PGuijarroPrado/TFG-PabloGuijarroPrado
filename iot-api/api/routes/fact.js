const express = require('express');
const checkAuth = require('../middleware/check-auth');
const { MESSAGE } = require('../controllers/static');

class FactRoutes {

    routes = express.Router();
    facts = [];

    constructor(sensors = []) {
        sensors.forEach((sensor) => {
            sensor.on((value) => {
                this.facts = this.facts.concat(value).splice(-100);
            });
        });

        this.routes.get('/', checkAuth, async (req, res) => {
            const response = {
                code: 500,
                body: undefined
            }
    
            try {
                if (!req.AuthData.admin) {
                    response.code = 401;
                    response.body = MESSAGE[401];
    
                    throw response;
                }
    
                const facts = this.facts;
    
                if (!facts.length) {
                    response.code = 404;
                    response.body = MESSAGE[404];
    
                    throw response;
                }
    
                response.code = 200;
                response.body = events;
    
            } catch(e) {
                response.code = e.code || 500;
                response.body = e.body || e.stackTrace;
            }
    
            res.status(response.code).json(response.body);
        });
    }
}

module.exports = FactRoutes;