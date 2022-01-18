import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

export class Speaker {
    private service: Service;
    private id: number;
    private deviceType = "Speaker";
    private eventMuteStateMsg = "eventMuteState";
    private setMuteStateMsg = "setMuteState";
    private getMuteStateMsg = "getMuteState";
    private eventVolumeStateMsg = "eventVolumeState";
    private setVolumeStateMsg = "setVolumeState";
    private getVolumeStateMsg = "getVolumeState";

    /**
    * These are just used to create a working example
    * You should implement your own code to track the state of your accessory
    */
    private states = {
        Name: "",
        Mute: 0,
        Volume: 0
    }

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        private eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getMuteStateMsg}`, this.getMuteStateMsgEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventMuteStateMsg}`, this.setMuteStateMsgEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getVolumeStateMsg}`, this.getVolumeStateMsgEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventVolumeStateMsg}`, this.setVolumeStateMsgEvent.bind(this));

        this.states.Name = this.accessory.context.device.name;
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the Speaker service if it exists, otherwise create a new Speaker service
        // you can create multiple services for each accessory
        this.accessory.category = 26;
        this.service = this.accessory.getService(this.platform.Service.Speaker) || this.accessory.addService(this.platform.Service.Speaker);            

        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Television

        this.service.setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE);
        this.service.getCharacteristic(this.platform.Characteristic.Mute)
            .onGet(this.handleMuteGet.bind(this))
            .onSet(this.handleMuteSet.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.Volume)
            .onGet(this.handleVolumeGet.bind(this))
            .onSet(this.handleVolumeSet.bind(this));
            
        this.platform.api.publishExternalAccessories('homebridge-crestronplugin', [this.accessory]);
    }
        
    async handleMuteGet(): Promise<CharacteristicValue> {
        const mute = this.states.Mute;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Mute From Homekit -> ${mute}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getMuteStateMsg}:*`);
        return mute;
    }

    async handleVolumeGet(): Promise<CharacteristicValue> {
        const volume = this.states.Volume;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Volume From Homekit -> ${volume}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getVolumeStateMsg}:*`);
        return volume;
    }
        
    async handleMuteSet(value: CharacteristicValue){
        const tmpMuteValue = value as number;
        if (this.states.Mute != tmpMuteValue) {
            this.states.Mute = tmpMuteValue;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setMuteStateMsg}:${this.states.Mute}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Mute By Homekit -> ${tmpMuteValue}`);
        }
    }

    async handleVolumeSet(value: CharacteristicValue){
        const tmpVolumeValue = value as number;
        if (this.states.Volume != tmpVolumeValue) {
            this.states.Volume = tmpVolumeValue;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setVolumeStateMsg}:${this.states.Volume}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Volume By Homekit -> ${tmpVolumeValue}`);
        }
    }

    getMuteStateMsgEvent(value:number){
        const tmpMuteValue = value;
        if(this.states.Mute != tmpMuteValue){
            this.states.Mute = tmpMuteValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic Mute From Crestron Processor -> ${this.states.Mute}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Mute, this.states.Mute);
        }
    }

    setMuteStateMsgEvent(value:number){
        const tmpMuteValue = value;
        if(this.states.Mute != tmpMuteValue){
            this.states.Mute = tmpMuteValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Mute By Crestron Processor -> ${this.states.Mute}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Mute, this.states.Mute);
        }
    }

    getVolumeStateMsgEvent(value:number){
        const tmpVolumeValue = value;
        if(this.states.Volume != tmpVolumeValue){
            this.states.Volume = tmpVolumeValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic Volume From Crestron Processor -> ${this.states.Volume}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Volume, this.states.Volume);
        }
    }

    setVolumeStateMsgEvent(value:number){
        const tmpVolumeValue = value;
        if(this.states.Volume != tmpVolumeValue){
            if(tmpVolumeValue < 0)
            {
                this.states.Volume = 0;
            }
            else if(tmpVolumeValue > 100)
            {
                this.states.Volume = 100;
            }
            else
            {
                this.states.Volume = tmpVolumeValue;
            }
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Volume By Crestron Processor -> ${this.states.Volume}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Volume, this.states.Volume);
        }
    }
}
