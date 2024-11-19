import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import * as url from 'url';
import path from 'path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const port=8000;
const server=http.createServer()
const wss = new WebSocketServer({server});
let messages = [];
let id = 0;
let state={
    snakes:[],
    apples:[],
    keypresses:[],
    score:[],
    screenDims:[],
    running:false
}
let app = express();
app.get('/', function(req, res) {;
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
server.on('request', app);
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        try { 
            data = JSON.parse(data);
            if(data.id==undefined) {data.id = id++; ws.send(JSON.stringify({ type: "init", id,msdId:data.msgId }));return;}else{
            if (messages[data.id] == undefined) messages[data.id] = [];
             messages[data.id].push(data);
             ws.send(JSON.stringify(handleMessages(data.id)));
            }
        } catch (e) { 
            ws.send(JSON.stringify({ type: "err", error: e.toString() }));
        }
    });
});
function handleMessages(id) {
    let msg=messages[id].pop();
    let data;
    let type;
    switch(msg.type){
        case "initGame":
            initGame(...msg.data);
            break;
        case "getState":
            data=state;
            type="state";
            break;
        case "update":
            state.keypresses[id]=msg.data;
            break; 
    }
    if(type==undefined) return { type: "ack",id,msgId:msg.msgId }
    return {type,id,data,msgId:msg.msgId}
}
function updateSnake(id){
    let snake=state.snakes[id];
    if(snake==undefined)snake=[];
    let keypress=state.keypresses[id];
    let head=[0,0];
    switch(keypress){
        case 0:
            head=[0,-1];
            break;
        case 1:
            head=[0,1];
            break;
        case 2:
            head=[-1,0];
            break;
        case 3:
            head=[1,0];
            break;
    }
   console.log([state.snakes[id][0][0]+head[0],state.snakes[id][0][1]+head[1]],state.snakes[id],head,keypress);
    state.snakes[id].unshift([state.snakes[id][0][0]+head[0],state.snakes[id][0][1]+head[1]]);
    if(!state.apples.includes(state.snakes[id][0])){state.snakes[id].pop();}else{state.apples.splice(state.apples.indexOf(snakes[id][0]),1);state.score[id]++;}
}
function initGame(playerCount,screenDims){
    for(let i=0;i<playerCount;i++){
        state.snakes[i]=[[Math.floor(Math.random()*10),Math.floor(Math.random()*10)]];
        state.keypresses[i]=3;
        state.score[i]=0;
    }
    for(let i=0;i<Math.floor(Math.random()*(playerCount*10));i++){
        state.apples[i]=[Math.floor(Math.random()*screenDims[0]),Math.floor(Math.random()*screenDims[1])];
    }
    state.running=true;
    state.screenDims=screenDims;
    var loop=setInterval(()=>{
        state.snakes.forEach((v,id)=>updateSnake(id));
        if(apples.length==0)state.running=false;
        if(!state.running)clearInterval(loop);
    },16);
}
server.listen(port, function() {
    console.log('Listening on http://localhost:' + port);
})