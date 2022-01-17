import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

export class WindowCovering {
    private service: Service;
    private id: number;
    private eventEmitter: EventEmitter;
    private deviceType = "WindowCovering";
    private eventCurrentPositionMsg = "eventCurrentPosition";
    private getCurrentPositionMsg = "getCurrentPosition";
    private setTargetPositionMsg = "setTargetPosition";

    /**
    * These are just used to create a working example
    * You should implement your own code to track the state of your accessory
    */
    private states = {
        Name: "",
        TargetPosition: 0
    }

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.accessory = accessory;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getCurrentPositionMsg}`, this.getCurrentPositionMsgEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventCurrentPositionMsg}`, this.setCurrentPositionMsgEvent.bind(this));
        
        this.states.Name = this.accessory.context.device.name;
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the Television service if it exists, otherwise create a new Television service
        // you can create multiple services for each accessory

        this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);            

        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.

        this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Television

        this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
            .onGet(this.handleCurrentPositionGet.bind(this))

        this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
            .onGet(this.handleTargetPositionGet.bind(this))
            .onSet(this.handleTargetPositionSet.bind(this));
    }

    async handleCurrentPositionGet(): Promise<CharacteristicValue> {
        const currentPosition = this.states.TargetPosition;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentPosition From Homekit -> ${currentPosition}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getCurrentPositionMsg}:*`);
        return currentPosition;
    }

    async handleTargetPositionGet(): Promise<CharacteristicValue> {
        const targetPosition = this.states.TargetPosition;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic TargetPosition From Homekit -> ${targetPosition}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getCurrentPositionMsg}:*`);
        return targetPosition;
    }

    async handleTargetPositionSet(value: CharacteristicValue){
        const tmpTargetPosition = value as number;
        if(this.states.TargetPosition != tmpTargetPosition) {
            this.states.TargetPosition = tmpTargetPosition;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic TargetPosition By Homekit -> ${tmpTargetPosition}`);
        }
    }
    
    getCurrentPositionMsgEvent(value: number) {
        const tmpCurrentPosition = value;
        if (this.states.TargetPosition != tmpCurrentPosition) {
            this.states.TargetPosition = tmpCurrentPosition;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic CurrentPosition By Crestron Processor -> ${tmpCurrentPosition}`);
            this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.states.TargetPosition);
        }
    }
    
    setCurrentPositionMsgEvent(value: number) {
        const tmpCurrentPosition = value;
        if (this.states.TargetPosition != tmpCurrentPosition) {
            this.states.TargetPosition = tmpCurrentPosition;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic CurrentPosition By Crestron Processor -> ${tmpCurrentPosition}`);
            this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.states.TargetPosition);
        }
    }
}
