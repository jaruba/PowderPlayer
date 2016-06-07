import Registry from 'winreg';

var commandToArgs = command => {
    return command.map((arg) => `"${arg}"`).join(' ')
}

module.exports = (ext, id, name, icon, command) => {

    var setExt = () => {
        var extKey = new Registry({
            hive: Registry.HKCU, // HKEY_CURRENT_USER
            key: '\\Software\\Classes\\' + ext
        })
        extKey.set('', Registry.REG_SZ, id, setId)
    }

    var setId = err => {
        if (err) log.error(err.message)

        var idKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Classes\\' + id
        })
        idKey.set('', Registry.REG_SZ, name, setIcon)
    }

    var setIcon = err => {
        if (err) log.error(err.message)

        var iconKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Classes\\' + id + '\\DefaultIcon'
        })
        iconKey.set('', Registry.REG_SZ, icon, setCommand)
    }

    var setCommand = err => {
        if (err) log.error(err.message)

        var commandKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Classes\\' + id + '\\shell\\open\\command'
        })
        commandKey.set('', Registry.REG_SZ, `${commandToArgs(command)} "%1"`, done)
    }

    var done = err => {
        if (err) log.error(err.message)
    }

    setExt()
}
