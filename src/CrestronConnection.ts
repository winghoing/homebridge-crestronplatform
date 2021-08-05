import { Socket } from "net";
import { CrestronPlatform } from "./CrestronPlatform";

export class CrestronConnection {
    platform: CrestronPlatform;
    creskitConn: Socket;
    port: number;
    host: string;

    constructor(port: number, host: string, platform: CrestronPlatform) {
        this.platform = platform;
        this.creskitConn = new Socket();
        this.port = port;
	this.host = host;
        if(this.host != undefined || this.host != ""){
           this.creskitConn.on("error", this.connErrorEvent.bind(this));
           this.creskitConn.on("timeout", this.connTimeOutEvent);
           this.creskitConn.on("connect", this.connectedEvent.bind(this));
           this.creskitConn.on("data", this.dataEvent.bind(this));
           this.creskitConn.on("end", this.disconnectedEvent.bind(this));
           this.connectToHost();
        }
    }

    connectToHost() {
        if(this.creskitConn != undefined){
           console.log(`connect to ${this.host}:${this.port}`);
	   this.creskitConn.connect(this.port, this.host);
        }
    }

    connErrorEvent() {
        if(this.creskitConn != undefined){
           console.log("connection error");
           console.log(`reconnect to ${this.host}:${this.port} again`);
           setTimeout(function (this: CrestronConnection) {
               this.creskitConn.connect(this.port, this.host);
           }.bind(this), 2000);
        }
    }

    connTimeOutEvent() {
        console.log("connection time out");
    }

    dataEvent(data: string): void {
        if(this.platform != undefined){
           this.platform.processData(data.toString());
        }
    }

    connectedEvent() {
        console.log("connected to the host");
    }

    disconnectedEvent() {
        if(this.creskitConn != undefined){
           console.log("disconnected from the host");
           console.log(`reconnect to ${this.host}:${this.port} again`);
           setTimeout(function (this: CrestronConnection) {
               this.creskitConn.connect(this.port, this.host);
           }.bind(this), 2000);
        }
    }

    writeData(data: string) {
        if(this.creskitConn != undefined){
           this.creskitConn.write(data);
        }
    }
}
