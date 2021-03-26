module.exports = {
    config: {
        apiKey: "c2b08663-06e3-440c-ef6f-13978b42883a",
        securityKey: "f26baf68-e3a9-45fc-effe-502e47116265",
        organization_Id: "5de0387b12e200ea63204d6c",
        host: "server.cocreate.app:3002"
    },
 
    sources: [{
            path: "./docs/index.html",
            collection: "files",
            document_id: "6029b6a3e979fb17407e25dc",
            key: "html",
            data:{
                name: "Twilio Doc",
            }
        },
    ],
   
    crud: [{
            collection: "routes",
            document_id: "6029b6a3e979fb17407e25db",
            data:{
                collection: "files",
                document_id: "6029b6a3e979fb17407e25dc",
                name: "html",
                domains: ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                route: "/docs/twilio",
            }
        }
    ],
    
    extract: {
        directory: "./src/",
        extensions: [
            "js",
            "css",
            "html"
        ],
        ignores: [
            "node_modules",
            "vendor",
            "bower_components",
            "archive"
        ],
    }
}
