# Node Utilities for Windows

Right now it's just a few wrappers around some builtin console commands but FFI bindings are soon to come.


## Command line tools

Some wrappers for the below APIs to be used on the command line.

```shell

cwddrive                          alias a random available drive letter to current working directory
cwddrive L                        alias L to CWD if not taken, or toggles it off if it currently is L
cwddrive L C:/some/folder         alias L to C:/some/folder if available

makerunnable f1.js [f2.js] ...    creates a .cmd file in npm.globalBin (is in PATH) that will exec the .js
```

## APIs

```javascript

driveAlias('x', folder)                  // alias a folder to `X:\`
driveAlias('x')                          // remove aliased `X:\` folderdrive
driveAlias()                             // list all aliased drives


runnable(['myCLI.js',...],function(r){   // for each js file given a %name%.cmd will be
  'NPMGLOBALBIN/myCLI.cmd created'       // create in the npm global bin directory that
    // or                                // will launch the given js file. npm's globalBin
  'Could not find myCLI.js'              // is added to PATH by default on installation
});


associations('.js'. 'jscript')           // add or change extension to type map
associations('.js')                      // retrieve type
associations()                           // list all extension -> types

fileTypes('jscript'. process.execPath)   // add or change program that handles a filetype
                                         // (example sets node as javascript's handler)
fileTypes('jscript')                     // retrieve handler for the type
fileTypes()                              // list all type -> handlers


getFontNames()                           // list all the fonts in the registry by type


findWindowsSDK() //-->                   // simply utility for detecting installed Windows
  { path: winSDKfolder,                  // SDKs (header files). Returns null if not found.
    versions: [8, 9, 10] }


registry(key, options)                   // returns an object containing the keys and values

v = registry('HKLM/Software/Microsoft'   // wrapped in objects allowing further fluent commands
v.someValue.remove()                     // delete value
v.add('newValue', 'myValue')             // add new value
v.add('newKey')                          // a key is like a folder
v.subKey                                 // getter which goes down one level deeper

x = registry('HKCU/Some/Random/Place')
x.add('newName', v.someValue)            // clone a value

z = v.aValue                             // manipulate wrapped values even after deleting them
z.remove()
v.add(z.name, z)  //oops undo

v.remove()                               // delete a key and all its contents recursively
v.remove('name')                         // just delete a child (key or value)


options = { search    : 'query',         // all options are optional
            recursive : false,
            case      : false,
            exact     : false,
            in        : 'keys' || 'values',
            type      : 'REG_SZ'     || 'REG_MULTI_SZ'  || 'REG_DWORD' ||
                        'REG_BINARY' || 'REG_EXPAND_SZ' || 'REG_QWORD' ||
                        'REG_NONE' }


// The raw commands are provided as well but are annoying to use directly

registry.query
registry.add
registry.delete
registry.copy
registry.save
registry.restore
registry.load
registry.unload
registry.compare
registry.export
registry.import
registry.flags


execSync('cmd' ...)                     // executes the command synchronously and returns the result,
                                        // flattening all params down to spaced delineation

Command(command, name, formatter)       // create a wrapped execSync calling function that executes
                                        // the command when called. Name and formatter are optiona,
                                        // with the default formatter splits the result into an array of lines




function parseCSV(str){
  return str.trim().split(/\r?\n/).map(function(str){
    return JSON.parse('['+str+']');
  });
  return str;
}

var nodes = Command('tasklist /fo csv /fi "imagename eq node.exe"', 'nodes', parseCSV);

nodes();

//  [ [ 'Image Name', 'PID', 'Session Name', 'Session#', 'Mem Usage' ],
//    [ 'node.exe', '6524', 'Console', '3', '13,060 K' ] ]

```