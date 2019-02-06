let configs;
if(process.env.NODE_ENV === 'production') {
  configs = {
    SERVER_URL:'https://www.dealme.today',
    CLIENT_URL:'https://www.dealme.today',
    FACEBOOK_GRAPH_API: "https://graph.facebook.com/v3.2",
    FACEBOOK_APP_ID : "794859637527349",
    FACEBOOK_CLIENT_SECRET : "c010fc0b17f887cb8fa9fb1658ad210f",
    GOOGLE_CLIENT_ID: '84477259757-3di3d87li4lgq4pr7q7987h6n83f5boo.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: 'TV0scPwooyMMGb2oaOmLoXe4'
  }
}
else{
  configs = {
    SERVER_URL:'http://localhost:5000',
    CLIENT_URL:'http://localhost:8080',
    FACEBOOK_GRAPH_API: "https://graph.facebook.com/v3.2",
    FACEBOOK_APP_ID : "794859637527349",
    FACEBOOK_CLIENT_SECRET : "c010fc0b17f887cb8fa9fb1658ad210f",
    GOOGLE_CLIENT_ID: '84477259757-3di3d87li4lgq4pr7q7987h6n83f5boo.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: 'TV0scPwooyMMGb2oaOmLoXe4'

  }
}

module.exports = configs


