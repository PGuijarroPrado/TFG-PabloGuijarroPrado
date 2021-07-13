
var RuleEngine = require("node-rules");

class EngineService {
    R;
    _rules = [];

    constructor() {
        this.R = new RuleEngine();
    }


    rules = {
        add: (rule) => {
            this.R.register(rule);
            rule.timestamp = new Date().getTime();

            this._rules.push(rule);

            return rule;
        },
        update: (timestamp, rule) =>{
            // Delete it
            this.rules.remove(timestamp);
            // Add updated rule
            return this.rules.add(rule);
        },
        remove: (timestamp) => {
            this._rules = this._rules.filter((rule) => rule.timestamp !== timestamp);
            // Reset engine
            this.R = new RuleEngine();
            // Re register
            this._rules.forEach((rule) => this.R.register(rule));
        }
    }

    facts = {
        add: async (fact) => {
            console.log('Adding new fact: ', fact);
            return new Promise((resolve, reject) => {
                try {
                    this.R.execute(fact, (data) => {
                        resolve(data);
                    });
                } catch(e) {
                    reject(e);
                }
            });
        }
    }
}
// Return an instance of the class to handle it in memory
module.exports = EngineService;