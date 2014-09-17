

exports.config = {
    db_config: {
        host: "localhost",
        user: "root",
        password: "",
        database: "PhotoAlbums",

        pooled_connections: 125,
        idle_timeout_millis: 30000
    },

    port: 3030,
    host: 'http://localhost',

    static_content: "../static/"
};

