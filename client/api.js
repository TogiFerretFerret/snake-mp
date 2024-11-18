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
        this.socket.send(JSON.stringify(data));
    }
    async init(){
        
    }
}