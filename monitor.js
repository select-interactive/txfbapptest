const { io } = require("socket.io-client");

const URL = process.env.URL ||  'https://texas-football-scores-sockets.azurewebsites.net'; 

//"http://localhost:3001";

const inst = [];
const sockets = [];

let connCnt = 0;
let errCnt = 0;
let dcCnt = 0;

const createClient = (cnt) => {


    const transports = [ "websocket" ];
    const socket = io( `${ URL }/games?gameId=${ cnt }`, {
      'transports': [ 'websocket' ],
      'reconnection': false
    } );


    socket.on( 'connect', _ => {
        connCnt += 1;
        socket.emit( 'get-ip', ( r ) => console.log( r ) );
    } );

    socket.on( 'connect_error', _ => {
        errCnt += 1;
    } );

    socket.on( 'disconnect', _ => {
        dcCnt += 1;
    } );
    

    socket.on( 'show-ip', ( r ) => { 

        const ip = r.eth0[ 0 ];
        
        socket.clientId = cnt;

        //console.log(`cnt-> ${cnt} - ${ip}`);


        if ( inst.indexOf( ip ) < 0 ) {
            inst.push( ip );
            socket.ip = ip;
        }
        else {
            if ( !socket.ip || socket.ip == '' ) {
                socket.ip = '';
            }
        }
    } );

    socket.on( "conn-update", ( cnt ) => {
        if ( socket.ip != '' ) {
            console.log( `Server Connections ${ socket.ip } (${ socket.clientId })-> ${ cnt }` );
        }
      } );    

    return socket;
}

for ( let cnt = 1; cnt <= 400; cnt++ ) {
   sockets.push( createClient(cnt) );
}

console.log( '** Sockets Created' );

const report = _ => { 

    console.log( `Total Connections: ${ connCnt }  Errors=> ${errCnt}  Disconnect=> ${dcCnt}` );
    sockets.forEach( s => {
        //console.log( `${ s.clientId } ip-> ${ s.ip }` );
        
        if ( s.ip !== '' ) {
            //console.log( `Emit get-count-> ${ s.clientId }` );
            s.emit( 'get-count' );
        }
    })

    //console.log( '** Sockets Created->', sockets );
}
    
    
setInterval( _ => report(), 20000 );







