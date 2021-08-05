import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class HeaterCooler {
    private service: Service;
    private id: number;
    private eventEmitter: EventEmitter;
    private deviceType = "HeaterCooler";
    private eventPowerStateMsg = "eventPowerState";
    private setPowerStateMsg = "setPowerState";
    private getPowerStateMsg = "getPowerState";
    private eventTargetHeaterCoolerStateMsg = "eventTargetHeaterCoolerState";
    private setTargetHeaterCoolerStateMsg = "getTargetHeaterCoolerState";
    private getTargetHeaterCoolerStateMsg = "setTargetHeaterCoolerState";
    private eventCurrentTempMsg = "eventCurrentTemperature";
    private getCurrentTempMsg = "getCurrentTemperature";
    private eventTargetTempMsg = "eventTargetTemperature";
    private setTargetTempMsg = "setTargetTemperature";
    private getTargetTempMsg = "getTargetTemperature";
    private eventRotationSpeedMsg = "eventRotationSpeed";
    private setRotationSpeedMsg = "setRotationSpeed";
    private getRotationSpeedMsg = "getRotationSpeed";
    
    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private states = {
        Active: 0,
        CurrentHeaterCoolerState: 0;
        TargetHeaterCoolerState: 0;
        CurrentTemperature: 0,
        TargetTemperature: 0
    };

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        eventEmitter: EventEmitter
    ) {
        this.id = accessory.context.device.id;
        this.accessory = accessory;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}`, this.getPowerStateEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventPowerStateMsg}`, this.setPowerStateEvent.bind(this));
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        // get the LightBulb service if it exists, otherwise create a new LightBulb service
        // you can create multiple services for each accessory
        this.service = this.accessory.getService(this.platform.Service.HeaterCooler) || this.accessory.addService(this.platform.Service.HeaterCooler);

        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Lightbulb
        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.handleActiveSet.bind(this))
            .onGet(this.handleActiveGet.bind(this));
        
        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
            .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));
                  
        this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
            .onSet(this.handleTargetHeaterCoolerStateSet.bind(this))
            .onGet(this.handleTargetHeaterCoolerStateGet.bind(this));
                   
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTemperatureGet.bind(this));
        
        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onSet(this.handleRotationSpeedSet.bind(this))
            .onGet(this.handleRotationSpeedGet.bind(this));
        
        this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .onSet(this.handleCoolingThresholdTemperatureSet.bind(this))
            .onGet(this.handleCoolingThresholdTemperatureGet.bind(this));
            
        this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .onSet(this.handleHeatingThresholdTemperatureSet.bind(this))
            .onGet(this.handleHeatingThresholdTemperatuerGet.bind(this));
                   
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
    async handleActiveGet(): Promise<CharacteristicValue> {
        const isActive= this.states.Active;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Active From Homekit -> ${isActive}`);
        return isActive;
    }

    async handleCurrentHeaterCoolerStateGet(): Promise<CharacteristicValue> {
        const currentHeaterCoolerState = this.states.CurrentHeaterCoolerState;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentHeaterCoolerState  From Homekit -> ${currentHeaterCoolerState}`);
        return currentHeaterCoolerState;
    }

    async handleTargetHeaterCoolerStateGet(): Promise<CharacteristicValue> {
        const targetHeaterCoolerState = this.states.TargetHeaterCoolerState;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic TargetHeaterCoolerState  From Homekit -> ${targetHeaterCoolerState}`);
        return targetHeaterCoolerState;
    }
    
    async handleCurrentTemperatureGet(): Promise<CharacteristicValue> {
        const currentTemperature = this.states.CurrentTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentTemperature From Homekit -> ${currentTemperature}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getMsg}:*`);
        return currentTemperature;
    }
    
    async handleCoolingThresholdTemperatureGet(): Promise<CharacteristicValue> {
        const targetTemperature = this.states.TargetTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CoolingThresholdTemperature From Homekit -> ${targetTemperature}`);
        return targetTemperature;
    }
    
    async handleHeatingThresholdTemperatureGet(): Promise<CharacteristicValue> {
        const targetTemperature = this.states.TargetTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic HeatingThresholdTemperature From Homekit -> ${targetTemperature}`);
        return targetTemperature;
    }

    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Brightness
     */
    async handleActiveSet(value: CharacteristicValue) {
        this.states.Active = value as number;
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Active By Homekit -> ${value}`);
        /*
        this.states.On = value as boolean;
        if (this.states.On == true && this.states.Brightness == 0) {
            this.states.Brightness = 100;
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setMsg}:${this.states.Brightness}:*`);
        }
        else if (this.states.On == false) {
            this.states.Brightness = 0;
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setMsg}:${this.states.Brightness}:*`);
        }

        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic On By Homekit -> ${value}`);
        */
    }
    
    async handleTargetHeaterCoolerStateSet(value: CharacteristicValue) {
        this.states.TargetHeaterCoolerState = value as number;
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic TargetHeaterCoolerState By Homekit -> ${value}`);
    }
    
    async handleCoolingThresholdTemperatureSet(value: CharacteristicValue) {
        this.states.TargetTemperature = value as number;
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic CoolingThresholdTemperature By Homekit -> ${value}`);
    }
    
    async handleHeatingThresholdTemperatureSet(value: CharacteristicValue) {
        this.states.TargetTemperature = value as number;
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic HeatingThresholdTemperature By Homekit -> ${value}`);
    }

    getPowerStateEvent(value: number) {
        /*
        let tmpValue = value;

        if (this.states.Brightness != tmpValue) {
            this.states.On = (tmpValue > 0) ? true : false;
            this.states.Brightness = tmpValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic Brightness From Crestron Processor -> ${this.states.Brightness}`);

            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
        }
        */
    }

    setPowerStateEvent(value: number) {
        /*
        let tmpValue = value;

        if (this.states.Brightness != tmpValue) {
            this.states.On = (tmpValue > 0) ? true : false;
            this.states.Brightness = tmpValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Brightness By Crestron Processor -> ${this.states.Brightness}`);

            this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
            this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
        }
        */
    }
}
