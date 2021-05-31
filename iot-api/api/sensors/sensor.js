

class Sensor {
    callbacks = [];

    constructor(type, limit) {
        this.type = type;
        this.limit = limit;
    }

    emit(value) {
        this.callbacks.forEach((cb) => cb({ [this.type]: value }));
    }

    on = (cb) => {
        if (typeof cb !== 'function') {
            return;
        }

        this.callbacks.push(cb);
    }
}

module.exports = Sensor;