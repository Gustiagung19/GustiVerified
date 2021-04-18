fx_version 'adamant'
game 'gta5'

client_scripts {
    "client.lua"
}

server_scripts {
	"config.lua",
	"server.lua",
	'@mysql-async/lib/MySQL.lua'
}

ui_page('html/index.html')

files({
    'html/index.html',
    'html/script.js',
    'html/style.css',
    'html/config.json',
    'html/toastify.css',
    'html/toastify.js'
})