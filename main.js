import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8000 });
let messages = [];
let id = 0;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        try { 
            data = JSON.parse(data);
            if(id!=undefined) {data.id = id++; ws.send(JSON.stringify({ type: "init", id }));}else{
            if (messages[data.id] == undefined) messages[data.id] = [];
             messages[data.id].push(data);
             ws.send(JSON.stringify({ type: "ack", messageNum: messages[data.id].length - 1 }));
            }
        } catch (e) { 
            ws.send(JSON.stringify({ type: "err", error: e }));
        }
    });


});