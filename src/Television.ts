import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

export class Television {
    private service: Service;
    private speakerService: Service;
    private id: number;
    private eventEmitter: EventEmitter;
    private deviceType = "Television";
    private eventPowerStateMsg = "eventPowerState";
    private setPowerStateMsg = "setPowerState";
    private getPowerStateMsg = "getPowerState";

    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private states = {
        Active: 0,
        ActiveIdentifier: 0,
        SleepDiscoveryMode: 1,
        Mute: 0,
        VolumeControlType: 3,
        VolumeSelector: 0,
        Volume: 24
    }

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.accessory = accessory;
        this.eventEmitter = eventEmitter;
            
        //this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}`, this.getPowerStateEvent.bind(this));
        //this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventPowerStateMsg}`, this.setPowerStateEvent.bind(this));
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the Television service if it exists, otherwise create a new Television service
        // you can create multiple services for each accessory
        this.service = this.accessory.getService(this.platform.Service.Television) || this.accessory.addService(this.platform.Service.Television);            
           
        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        //this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

        this.service.setCharacteristic(this.platform.Characteristic.ConfiguredName, accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Television

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.handleActiveSet.bind(this))
            .onGet(this.handleActiveGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onSet(this.handleActiveIdentifierSet.bind(this))
            .onGet(this.handleActiveIdentifierGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.SleepDiscoveryMode)
            .onSet(this.handleSleepDiscoveryModeSet.bind(this))
            .onGet(this.handleSleepDiscoveryModeGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RemoteKey)
            .onSet(this.handleRemoteKeySet.bind(this));
    }

    async handleActiveGet(): Promise<CharacteristicValue> {
        const isActive = this.states.Active;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Active From Homekit -> ${isActive}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return isActive;
    }

    async handleActiveIdentifierGet(): Promise<CharacteristicValue> {
        const activeIdentifier = this.states.ActiveIdentifier;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic ActiveIdentifier From Homekit -> ${activeIdentifier}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return activeIdentifier;
    }

    async handleSleepDiscoveryModeGet(): Promise<CharacteristicValue> {
        const sleepDiscoveryMode = this.states.SleepDiscoveryMode;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic SleepDiscoveryMode From Homekit -> ${sleepDiscoveryMode}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return sleepDiscoveryMode;
    }

    async handleMuteGet(): Promise<CharacteristicValue> {
        const mute = this.states.Mute;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Mute From Homekit -> ${mute}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return mute;
    }

    async handleVolumeControlTypeGet(): Promise<CharacteristicValue> {
        const volumeControlType = this.states.VolumeControlType;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic VolumeControlType From Homekit -> ${volumeControlType}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return volumeControlType;
    }

    async handleVolumeSelectorGet(): Promise<CharacteristicValue> {
        const volumeSelector = this.states.VolumeSelector;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic VolumeSelector From Homekit -> ${volumeSelector}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return volumeSelector;
    }

    async handleVolumeGet(): Promise<CharacteristicValue> {
        const volume = this.states.Volume;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Volume From Homekit -> ${volume}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return volume;
    }

    async handleActiveSet(value: CharacteristicValue) {
        const tmpActiveValue = value as number;
        if (this.states.Active != tmpActiveValue) {
            this.states.Active = tmpActiveValue;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Active By Homekit -> ${tmpActiveValue}`);
        }
    }

    async handleActiveIdentifierSet(value: CharacteristicValue) {
        const tmpActiveIdentifierValue = value as number;
        if (this.states.ActiveIdentifier != tmpActiveIdentifierValue) {
            this.states.ActiveIdentifier = tmpActiveIdentifierValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic ActiveIdentifier By Homekit -> ${tmpActiveIdentifierValue}`);
        }
    }

    async handleSleepDiscoveryModeSet(value: CharacteristicValue) {
        const tmpSleepDiscoveryModeValue = value as number;
        if (this.states.SleepDiscoveryMode != tmpSleepDiscoveryModeValue) {
            this.states.SleepDiscoveryMode = tmpSleepDiscoveryModeValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic SleepDiscoveryMode By Homekit -> ${tmpSleepDiscoveryModeValue}`);
        }
    }

    async handleRemoteKeySet(value: CharacteristicValue) {
        switch (value) {
            case this.platform.Characteristic.RemoteKey.REWIND: {
                this.platform.log.info('set Remote Key Pressed: REWIND');
                break;
            }
            case this.platform.Characteristic.RemoteKey.FAST_FORWARD: {
                this.platform.log.info('set Remote Key Pressed: FAST_FORWARD');
                break;
            }
            case this.platform.Characteristic.RemoteKey.NEXT_TRACK: {
                this.platform.log.info('set Remote Key Pressed: NEXT_TRACK');
                break;
            }
            case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK: {
                this.platform.log.info('set Remote Key Pressed: PREVIOUS_TRACK');
                break;
            }
            case this.platform.Characteristic.RemoteKey.ARROW_UP: {
                this.platform.log.info('set Remote Key Pressed: ARROW_UP');
                break;
            }
            case this.platform.Characteristic.RemoteKey.ARROW_DOWN: {
                this.platform.log.info('set Remote Key Pressed: ARROW_DOWN');
                break;
            }
            case this.platform.Characteristic.RemoteKey.ARROW_LEFT: {
                this.platform.log.info('set Remote Key Pressed: ARROW_LEFT');
                break;
            }
            case this.platform.Characteristic.RemoteKey.ARROW_RIGHT: {
                this.platform.log.info('set Remote Key Pressed: ARROW_RIGHT');
                break;
            }
            case this.platform.Characteristic.RemoteKey.SELECT: {
                this.platform.log.info('set Remote Key Pressed: SELECT');
                break;
            }
            case this.platform.Characteristic.RemoteKey.BACK: {
                this.platform.log.info('set Remote Key Pressed: BACK');
                break;
            }
            case this.platform.Characteristic.RemoteKey.EXIT: {
                this.platform.log.info('set Remote Key Pressed: EXIT');
                break;
            }
            case this.platform.Characteristic.RemoteKey.PLAY_PAUSE: {
                this.platform.log.info('set Remote Key Pressed: PLAY_PAUSE');
                break;
            }
            case this.platform.Characteristic.RemoteKey.INFORMATION: {
                this.platform.log.info('set Remote Key Pressed: INFORMATION');
                break;
            }
        }
    }

    async handleMuteSet(value: CharacteristicValue){
        const tmpMuteValue = value as number;
        if (this.states.Mute != tmpMuteValue) {
            this.states.Mute = tmpMuteValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Mute By Homekit -> ${tmpMuteValue}`);
        }
    }

    async handleVolumeControlTypeSet(value: CharacteristicValue){
        const tmpVolumeControlTypeValue = value as number;
        if (this.states.VolumeControlType != tmpVolumeControlTypeValue) {
            this.states.VolumeControlType = tmpVolumeControlTypeValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic VolumeControlType By Homekit -> ${tmpVolumeControlTypeValue}`);
        }
    }

    async handleVolumeSelectorSet(value: CharacteristicValue){
        const tmpVolumeSelectorValue = value as number;
        if (this.states.VolumeSelector != tmpVolumeSelectorValue) {
            this.states.VolumeSelector = tmpVolumeSelectorValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic VolumeSelector By Homekit -> ${tmpVolumeSelectorValue}`);
        }
    }

    async handleVolumeSet(value: CharacteristicValue){
        const tmpVolumeValue = value as number;
        if (this.states.Volume != tmpVolumeValue) {
            this.states.Volume = tmpVolumeValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Volume By Homekit -> ${tmpVolumeValue}`);
        }
    }
}
