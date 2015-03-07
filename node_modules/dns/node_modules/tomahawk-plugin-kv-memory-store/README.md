# Tomahawk plugin, implementing a Key Value Pair Store in Memory.

## To use this plugin

    npm install -g tomahawk-routes-kv-store
    npm install -g tomahawk-plugin-kv-memory-store

Then create a configuration file in your home directory:

    ~/.tomahawk/config.json
    {
        "plugins" : {
            "store" : {
                "context"        : "/store/api/v1",
                "interval"       : 1000,
                "implementation" : "tomahawk-plugin-kv-memory-store",
                "filename"       : "tomahawk-keyvalue-store"
            },
            "store-route" : {
                "implementation" : "tomahawk-routes-kv-store"
            }
        }
    }
