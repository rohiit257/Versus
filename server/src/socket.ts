import { Server } from "socket.io";

export function setupSocket(io:Server){
    io.on("connection",(socket)=>{
        console.log("user connection",socket.id);
        socket.on("disconnect", ()=>{
            console.log("user disconnected");
            
        })    

        socket.onAny((eventName:string,data:any)=>{
            if(eventName.startsWith("voting-")){
                console.log("the vote data is" , data)
            }

        })
    })

}