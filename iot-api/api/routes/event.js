const express = require('express');
const checkAuth = require('../middleware/check-auth');
const { MESSAGE } = require('../controllers/static');


// const router = express.Router();

// /* CONTROLLER */
// const eventController = require('../controllers/event.js');
// const checkAuth = require('../middleware/check-auth.js');

// /* API GET */
// router.get('/', checkAuth, eventController.eventGetAll);
// router.get('/:id', checkAuth, eventController.eventGetOne);

// /* API POST*/
// router.post('/', checkAuth, eventController.eventCreate);
// /* API PUT */
// router.put('/:id', checkAuth, eventController.eventUpdate);

// /* API DELETE */
// router.delete('/:id', checkAuth, eventController.eventDelete);

// module.exports = router;

class EventRoutes {
    routes = express.Router();

    constructor(eventService) {

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

                const events = await eventService.get();

                if (!events.length) {
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

        this.routes.get('/:id', checkAuth, async (req, res) => {
            const response = {
                code: 500,
                body: undefined
            }

            try {
                const { id } = req.params;
                const group = req.AuthData.admin ? undefined : req.AuthData.userGroup;
                const [ event ] = await eventService.get(id, group);

                if (!event) {
                    response.code = 404;
                    response.body = MESSAGE[404];

                    throw response;
                }

                response.code = 200;
                response.body = {
                    success: true,
                    message: 'Success at uploading an event to the server',
                    notify: `Evento '${newEvent.name}' creada`,
                    resourceId: newEvent._id,
                    resource: newEvent,
                };

            } catch(e) {
                response.code = e.code || 500;
                response.body = e.body || e.stackTrace;
            }

            res.status(response.code).json(response.body);
        });

        this.routes.post('/', checkAuth, async (req, res) => {
            const response = {
                code: 500,
                body: undefined
            }
            
            try {
                const { body: event } = req;
                const eventCreated = await eventService.add(event);

                response.code = 201;
                response.body = eventCreated;
            } catch(e) {
                response.code = e.code || 500;
                response.body = e.body || e.stackTrace;
            }

            res.status(response.code).json(response.body);
        });

        this.routes.put('/:id', checkAuth, async (req, res) => {
            const response = {
                code: 500,
                body: undefined
            }
            
            try {
                const { id } = req.params;
                const { body: event } = req;
                try {
                    const eventCreated = await eventService.update({ ...event, id });
                    response.code = 201;
                    response.body = eventCreated;
                } catch(e) {
                    response.code = 404;
                    response.body = MESSAGE[404];

                    throw response;
                }
            } catch(e) {
                response.code = e.code || 500;
                response.body = e.body || e.stackTrace;
            }

            res.status(response.code).json(response.body);
        });

        this.routes.delete('/:id', checkAuth, async (req, res) => {
            const response = {
                code: 500,
                body: undefined
            }
            
            try {
                const { id } = req.params;
                try {
                    const group = req.AuthData.admin ? undefined : req.AuthData.userGroup;
                    const event = await eventService.delete(id, group);
                    response.code = 201;
                    response.body = {
                        message: 'Success at removing an event from the collection',
                        success: true,
                        resourceId: id,
                    };
                } catch(e) {
                    response.code = 404;
                    response.body = MESSAGE[404];

                    throw response;
                }
            } catch(e) {
                response.code = e.code || 500;
                response.body = e.body || e.stackTrace;
            }

            res.status(response.code).json(response.body);
        });
    }
}

module.exports = EventRoutes;