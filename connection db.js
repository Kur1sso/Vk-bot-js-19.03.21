const mongoose = require(`mongoose`);
const config = require('./params/Config.json');
const { Schema } = mongoose;


async function initialize() {
	await mongoose.connect(config.mongo, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
}


const Scheme = new Schema({
	userId: String,
    link: String,
    root: Boolean,
});
const BlockModel = mongoose.model('Block', Scheme);
const AdminModel = mongoose.model('admin', Scheme);
const block = new BlockModel();
const admin = new AdminModel();
// block.userId = '39030519';
// block.link = 'https://vk.com/id39030519'
// block.save();



module.exports ={
	BlockModel: BlockModel,
	AdminModel: AdminModel,
	mongoose: mongoose,
	initialize: initialize,
}
