export const environment = {
  production: false,
  CI: false,
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  storeLikes: 'likes',
  baseUrl: 'https://api.rent-home.uz',
  urls: {
    GET_ANNONCEMENTS: '/api/announcement/',
    POST_REGISTER: '/register/',
    POST_LOGIN: '/api/token/',
    GET_TRANSPORTS: '/api/transport/',
    GET_COMMENTS: '/api/comment/',
    GET_ALLTRANSPORTS: '/api/proxy/',

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
    PUT_USER: '/api/users/'

  }
};
