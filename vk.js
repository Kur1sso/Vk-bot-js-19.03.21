const db = require('./connection db.js');
const config = require('./params/Config.json');
const vk = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const api = require('node-vk-bot-api/lib/api');
const schedule = require('node-schedule');
const block = db.BlockModel;

const bot = new vk({
  token: config.token,
  confirmation: 'f3bc0d1f',
});



async function initialize() {
	await bot.startPolling();
}


const job = schedule.scheduleJob('0 0 0 * * *', function(){
  block.find({},async function(err,item){
  	item.forEach(item => {
  		item.limit = 10;
  		item.save();
  	})
  })
});



bot.on(async (ctx,) => {
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
			if(item[0].limit <= 0){
				try{
					let groupId = ctx.message.peer_id - 2000000000;
					console.log(groupId)
					let f = await api('messages.removeChatUser',{ access_token: config.token, chat_id: [groupId], user_id:[setId] } );
					return;
				} catch(e){
					console.log(e)
				}
			}
			let acc = await bot.execute("users.get", {user_ids: [setId] });
			acc = acc[0];
			ctx.reply('@id'+ setId +' ('+ acc.first_name + acc.last_name +')'+', вы в черном списке! '+ '\nПричина:' + 'https://vk.com/public203135855?w=wall-203135855_'+item[0].link + '\n' +  'У вас осталось:' + (item[0].limit-1) + ' сообщений ');
			if(ctx.message.action.type == undefined){
				item[0].limit = item[0].limit - 1;
				item[0].save();
				return;
			}
			})
}



module.exports ={
	vk: bot,
	initialize: initialize,
}
