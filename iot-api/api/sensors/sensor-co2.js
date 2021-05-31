
var Sensor = require("./sensor");

class SensorCO2 extends Sensor {

  static volume = 400;

  constructor(interval){
    super("volume", SensorCO2.volume);
    this.read(interval);
  }

  read(interval){
    return this.interval = setInterval(() => {
      this.emit(Math.floor(Math.random() * (500 - 0 + 1)) + 0);
    }, interval);
  }

  stop(){
    clearInterval(this.interval);
  } 
}

module.exports = SensorCO2;
