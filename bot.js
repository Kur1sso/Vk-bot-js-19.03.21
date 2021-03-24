const db = require('./connection db.js');
const vk = require('./vk.js');
const vkPm = require('./pmVk.js');

(async function main () {
	console.log(`Polling started`);
	await db.initialize();
	console.log(`mongoose connected`);
	vk.initialize();
	console.log(`vk group message polling connected`);
	vkPm.initialize();
	console.log(`vk personal message polling connected`)
})();

