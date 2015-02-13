config =
{
    db :
    {
        adminName 	  : "misha",
        adminPassword : "qwerty123",
        dbName        : "blog",
        port 	      : "27017",
        server 	      : "mongodb://localhost"
    }
};

function getConnectString()
{
    return config.db.server + ":" + config.db.port + "/" + config.db.dbName;
}

exports.config = config;

exports.getConnectAddress = getConnectString;