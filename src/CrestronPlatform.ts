import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge";
import { EventEmitter } from "events";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { CrestronConnection } from "./CrestronConnection";
import { Lightbulb } from "./Lightbulb";
import { DimLightbulb } from "./DimLightbulb";
import { HeaterCooler } from "./HeaterCooler";
import { Television } from "./Television";

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class CrestronPlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
    private crestronConn: CrestronConnection;
    eventEmitter: EventEmitter;

    // this is used to track restored cached accessories
    public readonly accessories: PlatformAccessory[] = [];

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {
        this.log.debug(`Finished initializing platform: ${this.config.name}`);
        this.crestronConn = new CrestronConnection(this.config["port"], this.config["host"], this);
        this.eventEmitter = new EventEmitter();
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on("didFinishLaunching", () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }

    processData(data: string) {
        var msgArr = data.toString().split("*");
        for (let msg of msgArr) {
            var msgDataArr = msg.toString().split(":");
            if (msgDataArr[0].trim() != "") {
                this.log.info(`received data from crestron: ${msgDataArr}`);
                var emitMsg = `${msgDataArr[0]}:${msgDataArr[1]}:${msgDataArr[2]}`;
                this.log.info(`emit message: ${emitMsg}`);
                this.eventEmitter.emit(emitMsg, parseInt(msgDataArr[3]));
            }
        }
    }

    sendData(data: string) {
        this.log.info(`send data to crestron: ${data}`);
        this.crestronConn.writeData(data);
    }

    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory) {
        this.log.info(`Loading accessory from cache: ${accessory.displayName}`);

        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }

    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices() {

        // EXAMPLE ONLY
        // A real plugin you would discover accessories from the local network, cloud services
        // or a user-defined array in the platform config.
        let configNonDimLightbulbs = this.config["non-dimmable-lightbulbs"];
        let configDimLightbulbs = this.config["dimmable-lightbulbs"];
        let configHeaterCoolers = this.config["heatercoolers"];
        let configTelevisions = this.config["televisions"];
        //this.log.info(`printing accessories: ${configDevices}`);
        this.registerDevices(configNonDimLightbulbs, "NonDimLightbulb");
        this.registerDevices(configDimLightbulbs, "DimLightbulb");
        this.registerDevices(configHeaterCoolers, "HeaterCooler");
        this.registerDevices(configTelevisions, "Television");
    }

    registerDevices(configDevices, deviceType) {
        // loop over the discovered devices and register each one if it has not already been registered
        if (configDevices != undefined) {
            for (let device of configDevices) {

                // generate a unique id for the accessory this should be generated from
                // something globally unique, but constant, for example, the device serial
                // number or MAC address
                //console.log("printing current device: " + device.toString());
                //this.log.info(`printing current device: ${device.toString()}`);
                const uuid = this.api.hap.uuid.generate(device.name.toString() + device.id.toString());

                // see if an accessory with the same uuid has already been registered and restored from
                // the cached devices we stored in the `configureAccessory` method above
                const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

                if (existingAccessory) {
                    // the accessory already exists
                    this.log.info(`Restoring existing accessory from cache: ${existingAccessory.displayName}`);

                    // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                    existingAccessory.context.device = device;
                    existingAccessory.displayName = device.name;
                    this.api.updatePlatformAccessories([existingAccessory]);

                    // create the accessory handler for the restored accessory
                    // this is imported from `platformAccessory.ts`
                    this.log.info(`existing accessory type: ${deviceType}`);
                    switch (deviceType) {
                        case "NonDimLightbulb":
                            {
                                this.log.info(`create existing lightbulb accessory: ${existingAccessory.displayName}`);
                                new Lightbulb(this, existingAccessory, this.eventEmitter);
                                break;
                            }
                        case "DimLightbulb":
                            {
                                this.log.info(`create existing dimlightbulb accessory: ${existingAccessory.displayName}`);
                                new DimLightbulb(this, existingAccessory, this.eventEmitter);
                                break;
                            }
                        case "HeaterCooler":
                            {
                                this.log.info(`create existing heatercooler accessory: ${existingAccessory.displayName}`);
                                new HeaterCooler(this, existingAccessory, this.eventEmitter);
                                break;
                            }
                        case "Television":
                            {
                                this.log.info(`create existing television accessory: ${existingAccessory.displayName}`);
                                let tvAccessory = new Television(this, existingAccessory, this.eventEmitter);
                                tvAccessory.category = this.api.hap.Categories.TELEVISION;
                                break;
                            }
                    }

                    // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                    // remove platform accessories when no longer present
                    // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
                    // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
                } else {
                    // the accessory does not yet exist, so we need to create it
                    this.log.info(`adding new accessory: ${device.name}`);

                    // create a new accessory
                    const accessory = new this.api.platformAccessory(device.name, uuid);

                    // store a copy of the device object in the `accessory.context`
                    // the `context` property can be used to store any data about the accessory you may need
                    accessory.context.device = device;

                    // create the accessory handler for the newly create accessory
                    // this is imported from `platformAccessory.ts`
                    switch (deviceType) {
                        case "NonDimLightbulb":
                            {
                                this.log.info(`create not existing lightbulb accessory: ${accessory.displayName}`);
                                new Lightbulb(this, accessory, this.eventEmitter);
                                break;
                            }
                        case "DimLightbulb":
                            {
                                this.log.info(`create nof existing dimlightbulb accessory: ${accessory.displayName}`);
                                new DimLightbulb(this, accessory, this.eventEmitter);
                                break;
                            }
                        case "HeaterCooler":
                            {
                                this.log.info(`create not existing heatercooler accessory: ${accessory.displayName}`);
                                new HeaterCooler(this, accessory, this.eventEmitter);
                                break;
                            }
                        case "Television":
                            {
                                this.log.info(`create not existing television accessory: ${accessory.displayName}`);
                                let tvAccessory = new Television(this, accessory, this.eventEmitter);
                                tvAccessory.category = this.api.hap.Categories.TELEVISION;
                                break;
                            }
                    }

                    // link the accessory to your platform
                    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
                }
            }
        }
    }
}
