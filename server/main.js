import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8000 });
let messages = [];
let id = 0;
let state={
    snakes:[],
    apples:[],
    keypresses:[],
    score:[]
}
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        try { 
            data = JSON.parse(data);
            if(data.id==undefined) {data.id = id++; ws.send(JSON.stringify({ type: "init", id }));return;}else{
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
        case "loop":
            state.snakes.forEach((v,id)=>updateSnake(id));
            break;    
    }
    console.log(state);
    if(type==undefined) return { type: "ack",id }
    return {type,id,data}
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
}