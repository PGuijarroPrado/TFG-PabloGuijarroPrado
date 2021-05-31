

class SensorService {

    constructor(engineService, sensors = []) {
        sensors.forEach((sensor) => {
            sensor.on((value) => engineService.facts.add(value));
        });
    }
}

module.exports = SensorService;