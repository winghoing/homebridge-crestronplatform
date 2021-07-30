import { Socket } from 'net';
import { CrestronPlatform } from './CrestronPlatform';

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
        this.creskitConn.on("error", this.connErrorEvent.bind(this));
        this.creskitConn.on("timeout", this.connTimeOutEvent);
        this.creskitConn.on("connect", this.connectedEvent.bind(this));
        this.creskitConn.on("data", this.dataEvent.bind(this));
        this.creskitConn.on("end", this.disconnectedEvent.bind(this));
        this.connectToHost();
    }

    connectToHost() {
        this.creskitConn.connect(this.port, this.host);
    }

    connErrorEvent() {
        console.log("connection error");
        console.log("reconnect again");
        setTimeout(function (this: CrestronConnection) {
            this.creskitConn.connect(this.port, this.host);
        }.bind(this), 2000);
    }

    connTimeOutEvent() {
        console.log("connection time out");
    }

    dataEvent(data: string): void {
        this.platform.processData(data.toString());
    }

    connectedEvent() {
        console.log("connected to the host");
    }

    disconnectedEvent() {
        console.log("disconnected from the host");
        console.log("reconnect again");
        setTimeout(function (this: CrestronConnection) {
            this.creskitConn.connect(this.port, this.host);
        }.bind(this), 2000);
    }

    writeData(data: string) {
        this.creskitConn.write(data);
    }
}
