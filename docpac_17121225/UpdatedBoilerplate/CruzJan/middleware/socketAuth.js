// Socket.io client setup is to recieve sockets from formbar
const socket = io(`${AUTH_URL}`, {
    extraHeaders: {
        api: API_KEY
    }
});