class API{
    constructor(){
        this.url = 'wss://'+window.location.hostname;
        this.socket = new WebSocket(this.url);
        this.isOpen=()=>new Promise((resolve,reject)=>{
            if(this.socket.readyState===1){
                resolve();
            }
        })
    }
    async send(data){
        await this.isOpen();
        data.msgId=Math.floor(Math.random() * 2^32);
        this.socket.send(JSON.stringify(data));
        return await getMsg(data.msgId);
    }
    async getMsg(msgId){
        return new Promise((resolve,reject)=>{
            this.socket.onmessage=(e)=>{
                let data = JSON.parse(e.data);
                if(data.msgId===msgId){
                    resolve(data);
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
        let msg=await this.send({type:"getState",id:this.id}).data;
        let snakes;
        let apples;
        msg.snakes.forEach((snake,i)=>{
            snakes.push({score:msg.scores[i],body:snake});
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