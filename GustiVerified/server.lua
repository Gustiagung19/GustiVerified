local mysql_notReady = true
local attempts = {}
Citizen.CreateThread(function()
	while mysql_notReady do
		Citizen.Wait(1000)
		MySQL.ready(function ()
			mysql_notReady = false
		end)
	end
end)

AddEventHandler('playerConnecting', function(name, setCallback, deferrals)
    deferrals.defer()
    deferrals.update(config.checkingInfo)
	local _s = source

    Citizen.Wait(100)

	local ids = GetPlayerIdentifiers(_s)
	local steamid
	for i in ipairs(ids) do
		if(string.find(ids[i], "steam:") ~= nil) then
			steamid = ids[i]
		end
	end
    
    if steamid then
        deferrals.done()
    else
        deferrals.done(config.noEntry)
    end
end)

RegisterNetEvent('GustiVerified:checkPlayer')
AddEventHandler('GustiVerified:checkPlayer', function()
	local _s = source
	local ids = GetPlayerIdentifiers(source)
	local steamid
	for i in ipairs(ids) do
		if(string.find(ids[i], "steam:") ~= nil) then
			steamid = ids[i]
		end
	end

	if(mysql_notReady == true) then TriggerClientEvent('GustiVerified:clientCheck') return end
	
	MySQL.Async.fetchAll('SELECT * FROM ' .. config.tableName .. ' WHERE steam_id = @sid', {['@sid'] = steamid}, function(rows)
    	if(rows[1] == nil) then TriggerClientEvent('GustiVerified:toggleChecker', _s, true) end
	end)

end)

RegisterNetEvent('GustiVerified:checkCode')
AddEventHandler('GustiVerified:checkCode', function(code)
	local _s = source
	local givenCode = code
	local ids = GetPlayerIdentifiers(source)
	local steamid
	for i in ipairs(ids) do
		if(string.find(ids[i], "steam:") ~= nil) then
			steamid = ids[i]
		end
	end
	MySQL.Async.fetchAll('SELECT * FROM ' .. config.tableName .. ' WHERE code = @code AND steam_id IS null', {['@code'] = givenCode}, function(rows)
		if(#rows == 0) then
			if(attempts[steamid] == nil) then
				attempts[steamid] = 1
			else
				attempts[steamid] = attempts[steamid] + 1
				if(attempts[steamid] >= config.attempts) then
					DropPlayer(_s, config.tooManyWrongs)
					attempts[steamid] = nil
					return
				end
			end
			TriggerClientEvent('GustiVerified:giveError', _s, config.attempts - attempts[steamid])
		elseif(#rows ~= 0) then
			MySQL.Async.execute('UPDATE GustiVerified SET steam_id = @steamid WHERE code = @code', {['@steamid'] = steamid, ['@code'] = givenCode})
			TriggerClientEvent('GustiVerified:toggleChecker', _s, false)
		end
	end)
end)

RegisterNetEvent('GustiVerified:giveFalse')
AddEventHandler('GustiVerified:giveFalse', function()
	local _s = source
	TriggerClientEvent('GustiVerified:toggleChecker', _s, false)
end)

