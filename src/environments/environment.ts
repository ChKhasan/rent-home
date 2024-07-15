export const environment = {
  production: false,
  CI: false,
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  pendingComments: 'pending_comments',
  storeLikes: 'likes',
  baseUrl: 'http://new.rent-home.uz',
  urls: {
    GET_ANNONCEMENTS: '/api/announcement/',
    POST_REGISTER: '/register/',
    POST_LOGIN: '/api/token/',
    GET_TRANSPORTS: '/api/transport/',
    GET_COMMENTS: '/api/comment/',
    GET_ALLTRANSPORTS: '/api/proxy/',
    POST_LOCATIONBUSES: '/api/buses/',
    POST_BUSROUTES: '/api/bus/'
  },
  authUrls: {
    POST_ANNONCEMENTS: '/api/announcement/',
    PUT_ANNONCEMENTS: '/api/announcement/',
    GET_MY_ANNONCEMENTS: '/api/my-announcement/',
    GET_ME: '/api/users/me',
    GET_LIKES: '/api/like',
    POST_LIKES: '/api/like/',
    DELETE_LIKES: '/api/like',
    POST_ALLTRANSPORTS: '/api/transport/',
    POST_TRANSPORTS: '/api/proxy/',
    POST_COMMENTS: '/api/comment/',
    DELETE_COMMENTS: '/api/comment/',
    PUT_USER: '/api/users/',
    GET_USERROOMS: '/api/user-rooms/',
    GET_USERMESSAGES: '/api/user-rooms/'

  }
};
