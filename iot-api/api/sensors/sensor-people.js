
const Sensor = require('./sensor');

class SensorPeople extends Sensor {

  static capacity = 35;
  people = 0;

  constructor(interval) {
    super("capacity", SensorPeople.capacity);
    this.interval = this.read(interval);
  }

  read(interval) {
    return this.interval = setInterval(() => {
      this.people += Math.floor(Math.random() * 2) || -1;
      this.people = this.people < 0 ? 0 : this.people;

      this.emit(this.people);
    }, interval);
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = SensorPeople;