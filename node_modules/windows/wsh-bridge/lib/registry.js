wsh = CreateObject('WScript.Shell')
wsh.RegWrite('HKCU\\MyRegKey\\', 'Top level key')
wsh.RegWrite('HKCU\\MyRegKey\\Entry\\', 'Second level key')
wsh.RegWrite('HKCU\\MyRegKey\\Value', 1)
wsh.RegWrite('HKCU\\MyRegKey\\Entry', 2, 'REG_DWORD')
wsh.RegWrite('HKCU\\MyRegKey\\Entry\\Value1', 3, 'REG_BINARY')
wsh.RegDelete('HKCU\\MyRegKey\\Entry\\Value1')
wsh.RegDelete('HKCU\\MyRegKey\\Entry\\')
wsh.RegDelete('HKCU\\MyRegKey\\')


wsh.RegWrite(name, key

var types = {

}
['REG_SZ', 'REG_EXPAND_SZ', 'REG_DWORD', 'REG_BINARY']

var Registry = {
	write: function(path, name, type){
		type = type || 'REG_SZ';
	},
	read: function(path, name){

	},
	delete: function(path, name){

	}
};
