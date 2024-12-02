class API{
    
    constructor(){
        this.url = 'wss://'+window.location.hostname;
        this.socket = new WebSocket(this.url);
        this.msgs={};
    }
    isOpen(){
        if(this.open)return;
        return new Promise((resolve,reject)=>{
        this.socket.onopen=()=>{this.open=true;resolve();}
    })}
    async send(data){
        await this.isOpen();
        data.msgId= Math.floor(Math.random() * (2^32 - 0 + 1)) + 0;
        console.log("sending:",data);
        this.socket.send(JSON.stringify(data));
        return await this.getMsg(data.msgId);
    }
    async getMsg(msgId){
        return new Promise((resolve,reject)=>{
            this.msgs[msgId]=resolve;
            this.socket.onmessage=(e)=>{
                let data = JSON.parse(e.data);
                console.log("received:",data, this.msgs,Object.keys(this.msgs).includes(data.msgId.toString()));
                if(Object.keys(this.msgs).includes(data.msgId.toString())){
                    
                    this.msgs[data.msgId.toString()](data);
                }
            }
        })
    }
    async init(playerCount,screenWidth,screenHeight){
        let msg;
        if(this.id==undefined){
            msg=await this.send({type:"init"});
            this.id=msg.id;
        }
        msg=await this.send({type:"initGame",data:[playerCount,[screenWidth,screenHeight]],id:this.id});
        if(msg.type!=="ack")throw new Error("Transmission error");
    }
    async getState(){
        let msg=await this.send({type:"getState",id:this.id});
        msg=msg.data;
        let snakes=[];
        let apples=[];
        msg.snakes.forEach((snake,i)=>{
            if(msg.dead[i]==undefined)msg.dead[i]=false;
            snakes.push({score:msg.score[i],body:snake,dead:msg.dead[i]});
        })
        msg.apples.forEach(apple=>{
            apples.push({x:apple[0],y:apple[1]});
        })
        return {snakes,apples,gameRunning:msg.running,screenWidth:msg.screenDims[0],screenHeight:msg.screenDims[1]};
    }
    async moveSnake(id,direction){
        // 0: up, 1: down, 2: left, 3: right
        let msg=await this.send({type:"update",data:direction,id:id||this.id});
        if(msg.type!=="ack")throw new Error("Transmission error");
    }
}
function test(){
    let api=new API();
    api.init(2,100,100).then(async ()=>{
        setInterval(async ()=>console.log((await api.getState()).snakes),1000);
        
    });

}