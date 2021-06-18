
const SensorCO2 = require('../sensors/sensor-co2');
const SensorPeople = require("../sensors/sensor-people");

const Event = require('../models/event');
const { SELECTION } = require('../controllers/static');

class EventService {

    rules = {};

    callbacks = {
        capacity: [],
        volume: []
    }

    engineService;

    constructor(engineService) {
        this.engineService = engineService;
        this.load();
    }

    rule = {
        create: (event) => {
            const max = event.type === 'capacity' ? SensorPeople.capacity : SensorCO2.volume;

            return {
                condition: function (R) {
                    console.log('this: ', this);
                    R.when(this[event.type] >= max);
                },
                consequence: (R) => {
                    console.log('Executing consecuence...');
                    this.callbacks[event.type].forEach(cb => cb(event));
                    R.stop();
                }
            }
        }
    }

    add = async (event) => {
        console.log('Adding an event: ', event);
        let result;
        try {

            if (!event.displays) {
                events.displays = [];
            }
            // Save on DB
            const eventModel = new Event(event);
            const eventSaved = await eventModel.save();
            console.log('EventSaved: ', eventSaved);
            const { _id } = eventSaved;

            result = await Event.findById(_id).select(SELECTION.events.short);
            const ruleCreated = this.engineService.rules.add(this.rule.create(eventSaved));
            this.rules[_id] = ruleCreated.timestamp;
        } catch (e) {
            console.log('Error adding an event: ', e);
            throw e;
        }

        return result;
    }

    get = async (_id, userGroup) => {
        let result;
        console.log('Getting events: ', _id, userGroup);
        try {
            if (!_id) {
                result = await Event.find().select(SELECTION.events.short).exec();
            } else {
                const query = { _id };

                if (userGroup) {
                    query.userGroup = userGroup;
                }
                result = await Event.findById(query)
                    .select(SELECTION.events.long)
                    .populate('displays', SELECTION.displays.populate)
                    .populate('createdBy', SELECTION.screens.populate)
                    .populate('updatedBy', SELECTION.users.populate)
                    .populate('userGroup', SELECTION.userGroups.populate)
                    .exec();
            }

        } catch (e) {
            throw e;
        }

        return result;
    }

    on = (type, cb) => {
        if (typeof cb !== 'function') {
            return;
        }

        if (!['capacity', 'volume'].includes(type)) {
            return;
        }

        this.callbacks[type].push(cb);
    }

    update = async (event) => {
        console.log('Updating event: ', event);
        const { id: _id } = event;
        delete event.id;

        const eventUpdated = await Event.findOneAndUpdate({ _id }, { $set: event }, { new: true }).select(SELECTION.events.short);
        const updatedRule = this.engineService.rules.update(this.rules[_id], this.rule.create(eventUpdated));
        // Update id
        this.rules[_id] = updatedRule.id;
        // Return event
        return eventUpdated;
    }

    delete = async (_id, userGroup) => {
        console.log('Deleting event with id: ', _id);
        // Delete
        const query = { _id };

        if (userGroup) {
            query.userGroup = userGroup;
        }

        const event = await Event.findOne(query).remove();

        if (!event) {
            throw new Error();
        }
        // Remove rule from engine
        this.engineService.rules.remove(this.rules[event._id]);
        // Remove from array of rules
        delete this.rules[event._id];

        return event;
    }

    load = async() => {
        const events = await Event.find({ enabled : true }).select(SELECTION.events.short).exec();

        events.forEach((event) => {
            // Generate a rule
            const rule = this.rule.create(event);
            // Save id
            this.rules[event._id] = rule.timestamp;
            // Add to engine
            this.engineService.rules.add(rule);
        });
    }
}

module.exports = EventService;