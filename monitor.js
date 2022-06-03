const { io } = require("socket.io-client");

const URL = process.env.URL || "http://localhost:3001"; // 'https://texas-football-scores-sockets.azurewebsites.net'; 


const createClient = () => {


    const transports = [ "websocket" ];
    const socket = io( `${ URL }/games?gameId=${ 1 }`, {
      'transports': [ 'websocket' ],
      'reconnectionDelay': 10000
    } );


}




