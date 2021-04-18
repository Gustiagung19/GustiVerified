const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
const mysql = require('mysql');

try {
	if (!fs.existsSync(`./lang/${config.lang}.json`)) {
		console.log(`\nLanguage file /lang/${config.lang}.json not found!\nExiting process!\n`);
		process.exit(1);
	}
} catch(err) {
  console.error(err)
}
const lang = require(`./lang/${config.lang}.json`);

if(config.token == undefined || config.token == '' || config.command == undefined || config.command == '') {
	console.log(`ERROR01: ${lang.fillconfig}`);
	process.exit(1);
}

if(config.db == '' || config.db.host == '' || config.db.user == '' || config.db.database == '' || config.db.tablename == '' ||
   config.db == undefined || config.db.host == undefined || config.db.user == undefined || config.db.password == undefined || config.db.database == undefined || config.db.tablename == undefined) {
	console.log(`ERROR02: ${lang.filldb}`);
	process.exit(1);
}

client.on('ready', () => {
	if(config.name != '') {
		client.user.setUsername(config.name)
		.catch(err => {
			if(err.code == '50035') {
				console.log(`ERROR03: ${lang.toofast}`);
			}
		});
	}
	if(config.debug) console.log(`${lang.ready}`.replace('#BOTNAME#', `${client.user.username}`));
});

function generateString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var con = mysql.createConnection({
	host: config.db.host,
	user: config.db.user,
	password: config.db.password,
	database: config.db.database
});

con.connect(err => {
	if(err) {
		console.log(`ERROR04: ${err.sqlMessage}`);
		process.exit(1);
	}
	else {
		if(config.debug) console.log(`${lang.dbconnected}`);
		checkTableExisting();
	}
});

const pool = mysql.createPool({
	host: config.db.host,
	user: config.db.user,
	password: config.db.password,
	database: config.db.database
});
pool.query('select 1 + 1', (err, rows) => {});

function checkTableExisting() {
	con.query(`SELECT * FROM ${config.db.tablename}`, (err, rows) => {
		if(err && err.code == 'ER_NO_SUCH_TABLE') {
			console.log(`${lang.tablecreated}`.replace('#TABLENAME#', config.db.tablename));
			con.query(`CREATE TABLE \`${config.db.tablename}\` ( \`discord_id\` VARCHAR(255) NOT NULL , \`code\` VARCHAR(255) NOT NULL , \`steam_id\` VARCHAR(255) DEFAULT NULL , PRIMARY KEY (\`discord_id\`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_bin;`)
			checkTableExisting();
		}
	})
}

client.on('message', (msg) => {
	if(msg.content == config.command && msg.channel.id == config.channel_id) {
		con.query(`SELECT * FROM ${config.db.tablename} WHERE discord_id = ${msg.author.id}`, (err, rows) => {
			if (err) throw err;
			if(rows.length != 0) {
				msg.author.send(`${lang.coderesent}`.replace('#CODE#', rows[0].code))
				.then(r => {
					msg.reply(`${lang.codesent}`);
				})
				.catch(err => {
					if(err.code == "50007") {
						msg.reply(`${lang.botblocked}`.replace('#BOTMENTION#', `<@${client.user.id}>`));
					} else {
						console.log(`ERROR06: ${err.message}`);
					}
				})
			} else {
				var code = generateString(config.code_length);
				msg.author.send(`${lang.codemessage}`.replace('#CODE#', code))
				.then(r => {
					msg.reply(`${lang.codesent}`);
					con.query(`INSERT INTO ${config.db.tablename} (discord_id, code) VALUES ('${msg.author.id}', '${code}')`, (err, rows) => {
						if(err) {
							console.log(err);
						} else {
							if(config.debug) console.log(`${lang.usercreated}`.replace('#USERID#', `${msg.author.id}`).replace('#CODE#', `${code}`))
						}
					})
				})
				.catch(err => {
					if(err.code == "50007") {
						msg.reply(`${lang.botblocked}`.replace('#BOTMENTION#', `<@${client.user.id}>`));
					} else {
						console.log(`ERROR05: ${err.message}`);
					}
				})
			}
		});
	}
})

client.login(config.token);