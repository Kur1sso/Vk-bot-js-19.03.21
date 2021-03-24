const db = require('./connection db.js');
const config = require('./params/Config.json');
const vk = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const block = db.BlockModel;

const bot = new vk({
  token: config.token,
  confirmation: 'f3bc0d1f',
});



async function initialize() {
	await bot.startPolling();
}




bot.on(async (ctx) => {
	let id = ctx.message.from_id;
	if(ctx.message.peer_id < 2000000000){
		return;
	}
	if(ctx.message.action !== undefined){
		if (ctx.message.action.type == 'chat_kick_user'){
			return;
		}
		if (ctx.message.action.type == 'chat_invite_user'){
			blockMessage(ctx, ctx.message.action.member_id);
		}
	}
	console.log(ctx.message, id )
	blockMessage(ctx);
});


async function blockMessage(ctx, setId) {
	let id = ctx.message.from_id;
	if(setId == undefined){
		setId = id
	}
	block.find({userId: [setId]}, async function (err, item) {
			if(item.length == 0){
				return;
			}
			let acc = await bot.execute("users.get", {user_ids: [setId] });
			acc = acc[0];
			ctx.reply('@id'+ setId +' ('+ acc.first_name +')'+', ты в муте, чудище. Ищи себя на Davalki Saratov: ' + 'https://vk.com/public203135855?w=wall-203135855_'+item[0].link );
		})
}



module.exports ={
	vk: bot,
	initialize: initialize,
}
