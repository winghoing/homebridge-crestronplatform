import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { CrestronPlatform } from "./CrestronPlatform";

import { EventEmitter } from "events";

export class Television {
    private service: Service;
    //private speakerService: Service;
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
        ActiveIdentifier: 1,
        SleepDiscoveryMode: 1,
        IsInput1Configured: 0,
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
		
		this.states.ActiveIdentifier = 1;
        this.states.SleepDiscoveryMode = this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE;
		
		
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

        this.service.setCharacteristic(this.platform.Characteristic.ConfiguredName, this.accessory.context.device.name);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Television

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.handleActiveGet.bind(this))
            .onSet(this.handleActiveSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onGet(this.handleActiveIdentifierGet.bind(this))
            .onSet(this.handleActiveIdentifierSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.SleepDiscoveryMode)
            .onGet(this.handleSleepDiscoveryModeGet.bind(this))
            .onSet(this.handleSleepDiscoveryModeSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RemoteKey)
            .onSet(this.handleRemoteKeySet.bind(this));
            
        const input1Service = this.accessory.getService("TestInput1") || this.accessory.addService(this.platform.Service.InputSource, "TestInput1", "TestHDMI1");
		input1Service
			.setCharacteristic(this.platform.Characteristic.Identifier, 1)
			.setCharacteristic(this.platform.Characteristic.ConfiguredName, "HDMI 1")
			.setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
			.setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.HDMI)
			.setCharacteristic(this.platform.Characteristic.CurrentVisibilityState, this.platform.Characteristic.CurrentVisibilityState.SHOWN)
			.setCharacteristic(this.platform.Characteristic.Name, "TVHDMI1");

        this.service.addLinkedService(input1Service);
		
		const input2Service = this.accessory.getService("TestInput2") || this.accessory.addService(this.platform.Service.InputSource, "TestInput2", "TestHDMI2");
		input2Service
			.setCharacteristic(this.platform.Characteristic.Identifier, 2)
			.setCharacteristic(this.platform.Characteristic.ConfiguredName, "HDMI 2")
			.setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
			.setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.HDMI)
			.setCharacteristic(this.platform.Characteristic.CurrentVisibilityState, this.platform.Characteristic.CurrentVisibilityState.SHOWN)
			.setCharacteristic(this.platform.Characteristic.Name, "TVHDMI1");

        this.service.addLinkedService(input2Service);
		
	const speakerService = this.accessory.getService("TestSpeaker1") || this.accessory.addService(this.platform.Service.TelevisionSpeaker, "TestSpeaker2", "TestSpk2");

	speakerService
		.setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
		.setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);

	// handle volume control
	speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
		.onSet((newValue) => {
			this.platform.log.info('set VolumeSelector => setNewValue: ' + newValue);
	});
	this.service.addLinkedService(speakerService);
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
    
    async handleInputConfiguredNameGet(): Promise<CharacteristicValue> {
        const configuredName = "TestInput1";
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic IsInput1Configured From Homekit -> ${configuredName}`);
        return configuredName;
    }
    
    async handleInputSourceTypeGet(): Promise<CharacteristicValue>{
        const currentValue = this.platform.Characteristic.InputSourceType.OTHER;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic InputSourceType From Homekit -> ${currentValue}`);
        return currentValue;
    }
    
    async handleInputIsConfiguredGet(): Promise<CharacteristicValue> {
        const isInput1Configured = this.states.IsInput1Configured;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic IsConfigured From Homekit -> ${isInput1Configured}`);
        //this.platform.sendData(`${this.deviceType}:${this.id}:${this.getPowerStateMsg}:*`);
        return isInput1Configured;
    }
    
    async handleInputNameGet(): Promise<CharacteristicValue> {
        const name = "TestInput1";
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic Name From Homekit -> ${name}`);
        return name;
    }
    
    async handleInputCurrentVisibilityStateGet(): Promise<CharacteristicValue> {
        const currentVisibilityState = this.platform.Characteristic.CurrentVisibilityState.SHOWN;
        this.platform.log.info(`${this.deviceType}:${this.id}: Get Characteristic CurrentVisibilityState From Homekit -> ${currentVisibilityState}`);
        return currentVisibilityState;
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
        const tmpRemoteKeyValue = value as number;
        switch (tmpRemoteKeyValue) {
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
    
    async handleInputConfiguredNameSet(value: CharacteristicValue){
        const tmpConfiguredNameValue = value;
        this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic ConfiguredName By Homekit -> ${tmpConfiguredNameValue}`);
    }
    
    async handleInputIsConfiguredSet(value: CharacteristicValue){
        const tmpIsConfiguredValue = value as number;
        if(this.states.IsInput1Configured != tmpIsConfiguredValue){
            this.states.IsInput1Configured = tmpIsConfiguredValue;
            //this.platform.sendData(`${this.deviceType}:${this.id}:${this.setPowerStateMsg}:${this.states.Active}:*`);
            this.platform.log.info(`${this.deviceType}:${this.id}: Set Characteristic IsInput1Configured By Homekit -> ${tmpIsConfiguredValue}`);
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
