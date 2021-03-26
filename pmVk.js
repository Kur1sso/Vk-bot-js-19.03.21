const db = require('./connection db.js');
const config = require('./params/Config.json');
const vk = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const api = require('node-vk-bot-api/lib/api');
const Markup = require('node-vk-bot-api/lib/markup');
const Block = db.BlockModel;


const bot = new vk({
  token: config.token,
  confirmation: 'f3bc0d1f',
});

async function initialize() {
	await bot.startPolling();
}
let host = 39030519;



const sceneD = new Scene('del',
  (ctx) => {
  	if(ctx.message.peer_id > 2000000000){
  		return;
    }
    ctx.scene.next('del');
	ctx.reply('Укажите ссылку', null, Markup
		.keyboard([
			[
			Markup.button('back', 'negative'),
			]
		]),
	);
  },
  (ctx) => {
  	if(ctx.message.peer_id > 2000000000){
		return;
	}
	if(ctx.message.from_id != host){
		ctx.reply('У вас нет прав для данного действия.')
		return;
	}
	if(ctx.message.text.toLowerCase() == 'back' || ctx.message.text.toLowerCase() == 'назад'){
		ctx.reply('Введите команду', null, Markup
		.keyboard([
			[
			Markup.button('del', 'positive'),
			Markup.button('check', 'positive'),
			],
		]),
	);
		ctx.scene.leave();
		return;
	}
	let count = -1;
	let pos = 0;
	while (true) {
  		let foundPos = ctx.message.text.indexOf('vk.com',  pos);
 		count += 1;
 		if (foundPos == -1) break;
 		pos = foundPos + 1;
	}
	if (count == 0){
		ctx.reply('не указано ссылок');
		return;
	}
	let link = ctx.message.text.split("\n", count);
	let id = [];
	link.forEach(item => {
		item = item.split("/");
		id.push(item[item.length-1]);
		return ;
	});


	id.forEach(async a => {
		try {
			let acc = await bot.execute("users.get", {user_ids: [a] });
			await Block.deleteOne({userId: [acc[0].id]});
			ctx.reply(`Пользователь ${acc[0].first_name} ${acc[0].last_name} удален из ЧС`);
		} catch(e) {
			console.log(e)
			bot.sendMessage(host, 'Введена неверная ссылка');
		};
	});
});




const scene = new Scene('check',
  (ctx) => {
  	if(ctx.message.peer_id > 2000000000){
  		return;
    }
    try {
	ctx.reply('Укажите ссылку',null , Markup
		.keyboard([
			[
			Markup.button('back', 'negative'),
			]
		]),
	);
} catch(e){
	console.log(e)
}
	 ctx.scene.next();

  },
  (ctx) => {
  	if(ctx.message.peer_id > 2000000000){
		return;
	}
	if(ctx.message.from_id != host){
		ctx.reply('У вас нет прав для данного действия.')
		return;
	}
	if(ctx.message.text.toLowerCase() == 'back' || ctx.message.text.toLowerCase() == 'назад'){
		ctx.reply('Введите команду', null, Markup
		.keyboard([
			[
			Markup.button('del', 'positive'),
			Markup.button('check', 'positive'),
			],
		]),
	);
		ctx.scene.leave();
		return;
	}
	let count = -1;
	let pos = 0;
	while (true) {
  		let foundPos = ctx.message.text.indexOf('vk.com',  pos);
 		count += 1;
 		if (foundPos == -1) break;
 		pos = foundPos + 1;
	}
	if (count == 0){
		ctx.reply('не указано ссылок');
		return;
	}
	let link = ctx.message.text.split(" ", count);
	let id = [];
	link.forEach(item => {
		item = item.split("/");
		id.push(item[item.length-1]);
		return ;
	});
	id.forEach(async a => {
		try {
			let acc = await bot.execute("users.get", {user_ids: [a] });
			acc = acc[0];
			await Block.find({userId: [acc.id]}, async function (err, item) {
				if(item.length == 0){
					ctx.reply('Пользователь не найден в черном списке')
				}
				ctx.reply(acc.first_name +' '+ acc.last_name +' Заблокирован. Причина: ' + 'https://vk.com/public203135855?w=wall-203135855_'+item[0].link );
				return;
			})
		} catch(e) {
			console.log(e)
			ctx.reply('Введена неверная ссылка');
		};
	});
});










const session = new Session();
bot.use(session.middleware());
const stage = new Stage(scene, sceneD)
bot.use(stage.middleware())






bot.keyWord = function (command, func) {
	this.command(command, (ctx) =>{
		id = ctx.message.from_id;
		if(ctx.message.peer_id > 2000000000){
			console.log(ctx.message);
			return;
		}
		func(ctx);
	})
}

bot.event('wall_post_new', (ctx) =>{
	postToServer(ctx);
})


function postToServer (ctx) {
	let count = -1;
	let pos = 0;
	while (true) {
  		let foundPos = ctx.message.text.indexOf('vk.com',  pos);
 		count += 1;
 		if (foundPos == -1) break;
 		pos = foundPos + 1;
	}
	if (count == 0){
		bot.sendMessage(host, 'В последнем посте не было ссылок');
		return;
	}
	let link = ctx.message.text.split("\n", count);
	let id = [];
	link.forEach(item => {
		item = item.split("/");
		id.push(item[item.length-1]);
		return ;
	});
	id.forEach(async a => {
		try {
			let acc = await bot.execute("users.get", {user_ids: [a] });
			await Block.find({userId: [acc[0].id]}, function (err, item) {
				if(item.length > 0){
					return;
				}
			const block = new Block();
			block.userId = acc[0].id;
			block.link = ctx.message.id;
			block.limit = 20;
			block.save();
			})
		} catch(e) {
			console.log(e)
			bot.sendMessage(host, 'В последнем посте введена неверная ссылка');
		};
	});
 }


bot.keyWord('del', function (ctx){
	if(ctx.message.from_id != host){
		ctx.reply('У вас нет прав для данного действия.')
		return;
	}
	try{
	ctx.scene.enter('del');
} catch(e){
	console.log(e);
}
});
bot.keyWord('check', function (ctx){
	if(ctx.message.from_id != host){
		ctx.reply('У вас нет прав для данного действия.')
		return;
	}
		ctx.scene.enter('check');
});
bot.keyWord('start', function(ctx){
	ctx.reply('Введите команду', null, Markup
		.keyboard([
			[
			Markup.button('del', 'positive'),
			Markup.button('check', 'positive'),
			],
		]),
	);
})





bot.on((ctx) => {
	if(ctx.message.peer_id > 2000000000){
		return;
	}
	if(ctx.message.from_id != host){
		ctx.reply('У вас нет прав для данного действия.')
		return;
	}
	
});

module.exports ={
	vk: bot,
	initialize: initialize,
}
