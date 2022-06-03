const { io } = require("socket.io-client");

const URL = process.env.URL || 'https://texas-football-scores-sockets.azurewebsites.net'; // "http://localhost:3001";


const createClient = () => {


    const transports = [ "websocket" ];
    const socket = io( `${ URL }/games?gameId=${ gameId }`, {
      'transports': [ 'websocket' ],
      'reconnectionDelay': 10000
    } );


}




