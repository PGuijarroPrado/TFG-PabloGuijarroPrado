
var Jimp = require('jimp');
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const User = require('../models/user');
const Screen = require('../models/screen');


class ScreenService {

    constructor(eventService, sensors) {
        sensors.forEach(({ type }) =>  eventService.on(type, async (event) =>  this.update(sensor, event) ) );
    }

    update = async (sensor, event) => {
        const { type, type: name, limit } = sensor;
        const message = `Limit of ${type} was surpassed. \n
                         The limit is ${limit}.`;

        const displays = await Promise.all(event.displays.map(async (_id) => await Display.findOne({ _id }).exec()));
        // Update images for displays
        displays.forEach(({ images, _id }) => {
            // Get the screenCode
            const { screenCode } = await Device.findOne({ _id }).exec();
            // Get associated screen for device
            const { width, height, _id: screenId } = await Screen.findOne({ screenCode }).exec();
            // Create a Jimp object
            const bpm = new Jimp(width, height, 'white');
            // Load a font
            const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
            // Print on the object
            bpm.print(font, 0, 0, message);
            // Generate a path
            const path = `img/${screenId}/${type}.bpm`;
            const processPath = `${process.env.API_URL}${path}`;
            // Write on the path
            await bpm.writeAsync(`./${path}`);
            // Get the associated image
            const image = await Image.findOne({ name, displays: [ _id ] }).exec();

            if (image) {
                await Image.findByIdAndUpdate({ _id: image._id }, { src: processPath, path: `./${path}` }).exec();
                await Display.findByIdAndUpdate({ _id }, { activeImage: image._id }).exec();
                
                return;
            }

            var newImage = new Image();
            newImage.name = type;
            newImage.description = `Image for ${type}`;
            newImage.src = processPath;
            newImage.path = `./${path}`;
            newImage.extension = 'bmp';
            newImage.category = `screen/${type}`;
            newImage.displays = [ _id ];
            newImage.color = 'Escala de grises';

            const admin = await User.findOne({ name: 'admin' }).exec();
            newImage.createdBy = admin._id;
            const { _id: savedId } = await newImage.save();

            await Display.findByIdAndUpdate({ _id }, { images: images.concat(savedId), activeImage: savedId }).exec();
        });
    }
}

module.exports = ScreenService;