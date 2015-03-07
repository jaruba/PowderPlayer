var wsh = WScript.CreateObject('WScript.Shell');
var special = [
	'AllUsersDesktop',
	'AllUsersStartMenu',
	'AllUsersPrograms',
	'AllUsersStartup',
	'Desktop',
	'Favorites',
	'Fonts',
	'MyDocuments',
	'NetHood',
	'PrintHood',
	'Programs',
	'Recent',
	'SendTo',
	'StartMenu',
	'Startup',
	'Templates'
];
for (var i=0; i<special.length; i++) {
	special[i] = '"'+special[i]+'":"'+wsh.SpecialFolders(special[i]).replace(/\\/g,'\\\\')+'"';
}
WScript.Echo('{'+special+'}');