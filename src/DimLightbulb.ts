import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DimLightbulb {
    private service: Service;
    private id: number;
    private eventEmitter: EventEmitter;
    private deviceType = "DimLightbulb";
    private eventLightBrightnessMsg = "eventLightBrightness";
    private setLightBrightnessMsg = "setLightBrightness";
    private getLightBrightnessMsg = "getLightBrightness";

    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private states = {
        On: false,
        Brightness: 100
    };

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.accessory = accessory;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getLightBrightnessMsg}`, this.getBrightnessEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventLightBrightnessMsg}`, this.setBrightnessEvent.bind(this));
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the LightBulb service if it exists, otherwise create a new LightBulb service
        // you can create multiple services for each accessory
        this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Lightbulb
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.handleOnSet.bind(this))
            .onGet(this.handleOnGet.bind(this));

        // register handlers for the Brightness Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .onSet(this.handleBrightnessSet.bind(this))
            .onGet(this.handleBrightnessGet.bind(this));
    }

    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
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

    async handleBrightnessGet(): Promise<CharacteristicValue> {
        const brightness = this.states.Brightness;

        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Brightness From Homekit -> ${brightness}`);

        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getLightBrightnessMsg}:*`);

        return brightness;
    }

    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Brightness
     */
    async handleOnSet(value: CharacteristicValue) {
        this.states.On = value as boolean;
        if (this.states.On == true && this.states.Brightness == 0) {
            this.states.Brightness = 100;
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setLightBrightnessMsg}:${this.states.Brightness}:*`);
        }
        else if (this.states.On == false) {
            this.states.Brightness = 0;
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setLightBrightnessMsg}:${this.states.Brightness}:*`);
        }

        this.platform.log.info(`${this.id}: Set Characteristic On By Homekit -> ${value}`);
    }

    async handleBrightnessSet(value: CharacteristicValue) {
        // implement your own code to set the brightness
        let tmpBrightnessValue = value as number;

        if (this.states.Brightness != tmpBrightnessValue) {
            this.states.On = (tmpBrightnessValue > 0) ? true : false;
            this.states.Brightness = tmpBrightnessValue;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setLightBrightnessMsg}:${this.states.Brightness}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Brightness By Homekit -> ${this.states.Brightness}`);
        }
    }

    getBrightnessEvent(value: number) {
        let tmpBrightnessValue = value;
        let tmpOnValue = (tmpBrightnessValue > 0) ? true : false;
        if(this.states.On != tmpOnValue) {
            this.states.On = tmpOnValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic On From Crestron Processor -> ${this.states.On}`);
            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
        }
        
        if(this.states.Brightness != tmpBrightnessValue) { 
            this.states.Brightness = tmpBrightnessValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic Brightness From Crestron Processor -> ${this.states.Brightness}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
        }
    }

    setBrightnessEvent(value: number) {
        let tmpBrightnessValue = value;

        if (this.states.Brightness != tmpBrightnessValue) {
            this.states.On = (tmpBrightnessValue > 0) ? true : false;
            this.states.Brightness = tmpBrightnessValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Brightness By Crestron Processor -> ${this.states.Brightness}`);

            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
        }
    }
}
