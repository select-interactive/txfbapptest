const { io } = require("socket.io-client");

const URL = process.env.URL || 'https://texas-football-scores-sockets.azurewebsites.net'; // "http://localhost:3001";
const MAX_CLIENTS = 15000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 1;
const EMIT_INTERVAL_IN_MS = 10000;

//const gameId = 60847;, 69308, 72905 
const gameList = [ 60847, 69308 ];


//Ok lets see

let clientCount = MAX_CLIENTS;
let gameIdx = gameList.length - 1;
let totalConnections = 0;

let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

let countGet = false;

let abortConnections = false;
let disconnectCntr = 0;


const createClient = ( gameId, clientId ) => {

  if ( !abortConnections ) {

    let disconnected = true;

    const transports = [ "websocket" ];
    const socket = io( `${ URL }/games?gameId=${ gameId }`, {
      'transports': [ 'websocket' ],
      'reconnection': false
    } );

    //games?gameid=60847&userid=1

    socket.on( 'connect', _ => {
      totalConnections += 1;
      disconnected = false;
    } );

    socket.on( 'connect_error', ( e ) => {
      if ( !abortConnections ) {
        console.log( `** Connection Error (${ MAX_CLIENTS - clientId }) ${ e.message }` );
        clientCount = -1;
        abortConnections = true;
      }
    } );


    if ( !countGet ) {
      setInterval( () => {
        socket.emit( "get-count", ( cnt ) => {
          //console.log( `Server Connections->${cnt}` );
        } );
      }, EMIT_INTERVAL_IN_MS );

      countGet = true;

      socket.on( "conn-update", ( cnt ) => {
        console.log( `Server Connections-> ${ cnt }` );
      } );


    }

    socket.on( "disconnect", ( reason ) => {
      if ( !disconnected ) {
        disconnectCntr += 1;
        console.log( `${ clientId } -> ${ reason } : (${ disconnectCntr })` );
      }
      disconnected = true;
    } );
  
    socket.on( "update-score", ( reason ) => {
      //console.log(`score update`);
      packetsSinceLastReport++;
    } );

  }
  else {
    console.log( `Connection Skipped-> ${clientId}` );
  }

};


const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  if ( packetsSinceLastReport > 0 ) {
    console.log( `Score Update Msgs-> ${ packetsSinceLastReport }` );
  }

  console.log( `Total Disconnections : (${ disconnectCntr })` );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval( printReport, 5000 );


const runner = () => {
 
  if ( clientCount > 0 && !abortConnections ) {

    if ( gameIdx >= 0 ) {
      

      if ( clientCount % 100 === 0 ) {
        console.log( `Client #: ${ clientCount } / GameIdx: ${ gameIdx }` );
      }
      createClient( gameList[ gameIdx ], clientCount );
      gameIdx -= 1;
    }
    else {
      gameIdx = gameList.length - 1;
      clientCount -= 1;
    }

    setTimeout( _ => runner(), CLIENT_CREATION_INTERVAL_IN_MS );
    
    

  }
  else {
    if ( abortConnections ) {
      console.log( '===== Aborted due to error ====' );
    }
    console.log( `**** Successful Connections ${totalConnections} **` );
  }


}

runner();