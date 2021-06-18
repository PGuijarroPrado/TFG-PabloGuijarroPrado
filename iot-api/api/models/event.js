const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    description: { type: String, default: 'Sin descripción' },
    type: { type: String, required: true },
    enabled: { type: Boolean },
    displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    userGroup: { type: mongoose.Schema.Types.ObjectId, default: '5fda2b5086de6d4f2210510d' ,ref: 'UserGroup', required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new event an _id must be set in order to configure the url properly
eventSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}events/${id}`;
  next();
});

eventSchema.post('findOneAndUpdate', function(){
  var eventUpdated = this._update.$set;
  eventUpdated._id = this._conditions._id;
});



module.exports = mongoose.model('Event', eventSchema);

   // type: {type: String, default:'time' , enum: ['time', 'action'] ,required : true},
    // configData:{type: Array, required: true},