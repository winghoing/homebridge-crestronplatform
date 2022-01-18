import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Switch {
    private service: Service;
    private id: number;
    private deviceType = "Switch";
    private eventPowerStateMsg = "eventPowerState";
    private setPowerStateMsg = "setPowerState";
    private getPowerStateMsg = "getPowerState";

    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private states = {
        On: false
    };

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        private eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}`, this.getPowerStateMsgEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventPowerStateMsg}`, this.setPowerStateMsgEvent.bind(this));
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the switch service if it exists, otherwise create a new switch service
        // you can create multiple services for each accessory
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Lightbulb
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.handleOnGet.bind(this))
            .onSet(this.handleOnSet.bind(this));
    }

    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a switch is on.
     *
     * GET requests should return as fast as possbile. A long delay here will result in
     * HomeKit being unresponsive and a bad user experience in general.
     *
     * If your device takes time to respond you should update the status of your device
     * asynchronously instead using the `updateCharacteristic` method instead.
     * @example
     * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
     */
    async handleOnGet(): Promise<CharacteristicValue> {
        const isOn = this.states.On;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic On From Homekit -> ${isOn}`);
        return isOn;
    }

    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Brightness
     */
    async handleOnSet(value: CharacteristicValue) {
        let setValue = 0;
        this.states.On = value as boolean;
        setValue = this.states.On ? 1 : 0;
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${setValue}:*`);
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic On By Homekit -> ${value}`);
    }
    
    getPowerStateMsgEvent(value: boolean){
        let tmpValue = (value == 1) ? true : false;
        if (this.states.On != tmpOnValue) {
            this.states.On = tmpOnValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic On From Crestron Processor -> ${this.states.On}`);
            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
        }
    }
        
    setPowerStateMsgEvent(value: boolean){
        let tmpValue = (value == 1) ? true : false;
        if (this.states.On != tmpOnValue) {
            this.states.On = tmpOnValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic On From Crestron Processor -> ${this.states.On}`);
            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
        }
    }
}
