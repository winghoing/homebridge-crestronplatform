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
        CurrentHeaterCoolerState: 0,
        TargetHeaterCoolerState: 0,
        RotationSpeed: 100,
        CurrentTemperature: 24,
        CoolingThresholdTemperature: 24,
        HeatingThresholdTemperature: 24
    };

    constructor(
        private platform: CrestronPlatform,
        private accessory: PlatformAccessory,
        eventEmitter: EventEmitter
    ) {
        /*
        this.platform.log.info(`this.platform.config.minValue: ${this.platform.config.minValue}`);
        this.platform.log.info(`this.platform.config.maxValue: ${this.platform.config.maxValue}`);
        this.platform.log.info(`this.platform.config.minStep: ${this.platform.config.minStep}`);
        this.platform.log.info(`this.platform.config.temperatureDisplayUnit: ${this.platform.config.temperatureDisplayUnit}`);
        */
        this.id = accessory.context.device.id;
        this.accessory = accessory;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}`, this.getPowerStateEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventPowerStateMsg}`, this.setPowerStateEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getTargetHeaterCoolerStateMsg}`, this.getTargetHeaterCoolerStateEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventTargetHeaterCoolerStateMsg}`, this.setTargetHeaterCoolerStateEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getCurrentTempMsg}`, this.getCurrentTemperatureEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventCurrentTempMsg}`, this.setCurrentTemperatureEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getTargetTempMsg}`, this.getTargetTemperatureEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventTargetTempMsg}`, this.setTargetTemperatureEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.getRotationSpeedMsg}`, this.getRotationSpeedEvent.bind(this));
        this.eventEmitter.on(`${this.deviceType}:${this.id}:${this.eventRotationSpeedMsg}`, this.setRotationSpeedEvent.bind(this));
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
            .setProps({
                minValue: 1,
                maxValue: 2
            })
            .onSet(this.handleTargetHeaterCoolerStateSet.bind(this))
            .onGet(this.handleTargetHeaterCoolerStateGet.bind(this));
        
        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onSet(this.handleRotationSpeedSet.bind(this))
            .onGet(this.handleRotationSpeedGet.bind(this));
        
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .setProps({
                minValue: this.platform.config.minValue,
                maxValue: this.platform.config.maxValue,
                minStep: this.platform.config.minStep
            })
            .onGet(this.handleCurrentTemperatureGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .setProps({
                minValue: this.platform.config.minValue,
                maxValue: this.platform.config.maxValue,
                minStep: this.platform.config.minStep
            })
            .onSet(this.handleCoolingThresholdTemperatureSet.bind(this))
            .onGet(this.handleCoolingThresholdTemperatureGet.bind(this));
            
        this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .setProps({
                minValue: this.platform.config.minValue,
                maxValue: this.platform.config.maxValue,
                minStep: this.platform.config.minStep
            })
            .onSet(this.handleHeatingThresholdTemperatureSet.bind(this))
            .onGet(this.handleHeatingThresholdTemperatureGet.bind(this));
                   
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
        const isActive = this.states.Active;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Active From Homekit -> ${isActive}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return isActive;
    }
    
    async handleCurrentHeaterCoolerStateGet(): Promise<CharacteristicValue> {
        const currentHeaterCoolerState = this.states.CurrentHeaterCoolerState;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentHeaterCoolerState From Homekit -> ${currentHeaterCoolerState}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getCurrentHeaterCoolerStateMsg}:*`);
        reutrn currentHeaterCoolerState;
    }

    async handleTargetHeaterCoolerStateGet(): Promise<CharacteristicValue> {
        const targetHeaterCoolerState = this.states.TargetHeaterCoolerState;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic TargetHeaterCoolerState From Homekit -> ${targetHeaterCoolerState}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getTargetHeaterCoolerStateMsg}:*`);
        return targetHeaterCoolerState;
    }
    
    async handleRotationSpeedGet(): Promise<CharacteristicValue> {
        const rotationSpeed = this.states.RotationSpeed;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic RotationSpeed  From Homekit -> ${rotationSpeed}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getRotationSpeedMsg}:*`);
        return rotationSpeed;
    }
    
    async handleCurrentTemperatureGet(): Promise<CharacteristicValue> {
        const currentTemperature = this.states.CurrentTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentTemperature From Homekit -> ${currentTemperature}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getCurrentTempMsg}:*`);
        return currentTemperature;
    }
    
    async handleCoolingThresholdTemperatureGet(): Promise<CharacteristicValue> {
        const coolingThresholdTemperature = this.states.CoolingThresholdTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CoolingThresholdTemperature From Homekit -> ${coolingThresholdTemperature}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getTargetTempMsg}:*`);
        return coolingThresholdTemperature;
    }
    
    async handleHeatingThresholdTemperatureGet(): Promise<CharacteristicValue> {
        const heatingThresholdTemperature = this.states.HeatingThresholdTemperature;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic HeatingThresholdTemperature From Homekit -> ${heatingThresholdTemperature}`);
        this.platform.sendData(`${this.deviceType}:${this.id}:${this.getTargetTempMsg}:*`);
        return heatingThresholdTemperature;
    }

    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Brightness
     */
    async handleActiveSet(value: CharacteristicValue) {
        let tmpActiveValue = value as number;
        if(this.states.Active != tmpActiveValue) {
            this.states.Active = tmpActiveValue;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Active By Homekit -> ${value}`);
        }
    }
    
    async handleTargetHeaterCoolerStateSet(value: CharacteristicValue) {
        let tmpTargetHeaterCoolerState = value as number;
        if(this.states.TargetHeaterCoolerState != tmpTargetHeaterCoolerState) { 
            this.states.TargetHeaterCoolerState = tmpTargetHeaterCoolerState;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setTargetHeaterCoolerStateMsg}:${this.states.TargetHeaterCoolerState}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic TargetHeaterCoolerState By Homekit -> ${value}`);
        }
    }
    
    async handleRotationSpeedSet(value: CharacteristicValue) {
        let tmpRotationSpeed = value as number;
        if(this.states.RotationSpeed != tmpRotationSpeed) {
            this.states.RotationSpeed = tmpRotationSpeed;
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setRotationSpeedMsg}:${this.states.RotationSpeed}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic RotationSpeed By Homekit -> ${value}`);
        }
    }
    
    async handleCoolingThresholdTemperatureSet(value: CharacteristicValue) {
        let tmpCoolingThresholdTemperature = value as number;
        if(this.states.CoolingThresholdTemperature != tmpCoolingThresholdTemperature) {
            this.states.CoolingThresholdTemperature = tmpCoolingThresholdTemperature;
            this.states.HeatingThresholdTemperature = tmpCoolingThresholdTemperature;
            this.service.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, value);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setTargetTempMsg}:${this.states.CoolingThresholdTemperature}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic CoolingThresholdTemperature By Homekit -> ${value}`);
        }
    }
    
    async handleHeatingThresholdTemperatureSet(value: CharacteristicValue) {
        let tmpHeatingThresholdTemperature = value as number;
        if(this.states.HeatingThresholdTemperature != tmpHeatingThresholdTemperature) {
            this.states.HeatingThresholdTemperature = tmpHeatingThresholdTemperature;
            this.states.CoolingThresholdTemperature = tmpHeatingThresholdTemperature;
            this.service.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, value);
            this.platform.sendData(`${this.deviceType}:${this.id}:${this.setTargetTempMsg}:${this.states.HeatingThresholdTemperature}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic HeatingThresholdTemperature By Homekit -> ${value}`);
        }
    }

    getPowerStateEvent(value: number) {
        let tmpActiveValue = value;
        if (this.states.Active != tmpActiveValue) {
            this.states.Active = tmpActiveValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic Active From Crestron Processor -> ${this.states.Active}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Active, this.states.Active);
        }      
    }

    setPowerStateEvent(value: number) {
        let tmpActiveValue = value;
        if (this.states.Active != tmpActiveValue) {
            this.states.Active = tmpActiveValue;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic Active By Crestron Processor -> ${this.states.Active}`);
            this.service.updateCharacteristic(this.platform.Characteristic.Active, this.states.Active);
        }
    }
    
    getTargetHeaterCoolerStateEvent(value: number) {
        let tmpTargetHeaterCoolerState = value;
        if(this.states.TargetHeaterCoolerState != tmpTargetHeaterCoolerState) {
           this.states.TargetHeaterCoolerState = tmpTargetHeaterCoolerState;
           this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic TargetHeaterCoolerState By Crestron Processor -> $(this.states.TargetHeaterCoolerState}`);
           this.service.updateCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState, this.states.TargetHeaterCoolerState);
        }
    }
    
    setTargetHeaterCoolerStateEvent(value: number) {
        let tmpTargetHeaterCoolerState = value;
        if(this.states.TargetHeaterCoolerState != tmpTargetHeaterCoolerState) {
           this.states.TargetHeaterCoolerState = tmpTargetHeaterCoolerState;
           this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic TargetHeaterCoolerState From Crestron Processor -> $(this.states.TargetHeaterCoolerState}`);
           this.service.updateCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState, this.states.TargetHeaterCoolerState);
        }
    }
    
    getCurrentTemperatureEvent(value: number) {
        let tmpCurrentTemperature = value;
        if(this.states.CurrentTemperature != tmpCurrentTemperature) {
            this.states.CurrentTemperature = tmpCurrentTemperature;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic CurrentTemperature From Crestron Processor -> ${this.states.CurrentTemperature}`);
            this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.states.CurrentTemperature);
        }
    }
    
    setCurrentTemperatureEvent(value: number) {
        let tmpCurrentTemperature = value;
        if(this.states.CurrentTemperature != tmpCurrentTemperature) {
            this.states.CurrentTemperature = tmpCurrentTemperature;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic CurrentTemperature By Crestron Processor -> ${this.states.CurrentTemperature}`);
            this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.states.CurrentTemperature);
        }
    }
    
    getTargetTemperatureEvent(value: number) {
        let tmpTargetTemperature = value;
        if(this.states.CoolingThresholdTemperature != tmpTargetTemperature || this.states.HeatingThresholdTemperature != tmpTargetTemperature) {
            this.states.CoolingThresholdTemperature = tmpTargetTemperature;
            this.states.HeatingThresholdTemperature = tmpTargetTemperature;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic TargetTemperature From Crestron Processor -> ${tmpTargetTemperature}`);
            this.service.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, this.states.CoolingThresholdTemperature);
            this.service.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, this.states.HeatingThresholdTemperature);
        }
    }
    
    setTargetTemperatureEvent(value: number) {
        let tmpTargetTemperature = value;
        if(this.states.CoolingThresholdTemperature != tmpTargetTemperature || this.states.HeatingThresholdTemperature != tmpTargetTemperature) {
            this.states.CoolingThresholdTemperature = tmpTargetTemperature;
            this.states.HeatingThresholdTemperature = tmpTargetTemperature;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic TargetTemperature By Crestron Processor -> ${tmpTargetTemperature}`);
            this.service.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, this.states.CoolingThresholdTemperature);
            this.service.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, this.states.HeatingThresholdTemperature);
        }
    }
    
    getRotationSpeedEvent(value: number) {
        let tmpRotationSpeed = value;
        if(this.states.RotationSpeed != tmpRotationSpeed)
        {
            this.states.RotationSpeed = tmpRotationSpeed;
            this.platform.log.info(`${this.deviceType}:${this.id}: Retrieve Characteristic RotationSpeed From Crestron Processor -> ${this.states.RotationSpeed}`);
            this.service.updateCharacteristic(this.platform.Characteristic.RotationSpeed, this.states.RotationSpeed);
        }
    }
    
    setRotationSpeedEvent(value: number) {
        let tmpRotationSpeed = value;
        if(this.states.RotationSpeed != tmpRotationSpeed)
        {
            this.states.RotationSpeed = tmpRotationSpeed;
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic RotationSpeed By Crestron Processor -> ${this.states.RotationSpeed}`);
            this.service.updateCharacteristic(this.platform.Characteristic.RotationSpeed, this.states.RotationSpeed);
        }
    }
}
