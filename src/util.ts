import { interfaces as inversifyInterfaces } from "inversify";
import { NO_CONTROLLERS_FOUND, TYPE } from "./constants";
import {
    ControllerMetadata, ControllerMethodMetadata, ControllerParameterMetadata,
    METADATA_KEY
} from "./decorators/metadata";
import { BaseHttpController, IHttpActionResult } from "./core";

/**
 * Static class with utilities methods
 */
export class Util {

    /**
     * Instantiate all the controllers registered within a container
     * @param container The container to use
     * @param forceControllers Flag to control if an error is thrown when there is no controllers bound
     */
    public static getControllersFromContainer(container: inversifyInterfaces.Container,
                                              forceControllers: boolean): Array<BaseHttpController> {

        if (container.isBound(TYPE.Controller)) {
            return container.getAll<BaseHttpController>(TYPE.Controller);
        }
        else if (forceControllers) {
            throw new Error(NO_CONTROLLERS_FOUND);
        }
        else {
            return [];
        }
    }

    /**
     * Retriever all the registered controllers constructors that was decorated with the Controller
     * decorator.
     */
    public static getControllersFromMetadata(): Array<inversifyInterfaces.Newable<BaseHttpController>> {

        const arrayOfControllerMetadata: ControllerMetadata[] = Reflect.getMetadata(METADATA_KEY.controller,
            Reflect) || [];

        return arrayOfControllerMetadata.map((metadata) => metadata.target);
    }

    /**
     * Retrieve the controller metadata.
     * @param constructor The controller constructor
     */
    public static getControllerMetadata(constructor: inversifyInterfaces.Newable<BaseHttpController>): ControllerMetadata {

        return Reflect.getMetadata(METADATA_KEY.controller, constructor);
    }

    /**
     * Retrieve the constroller methods metadata
     * @param constructor The controller constructor
     */
    public static getControllerMethodMetadata(constructor: inversifyInterfaces.Newable<BaseHttpController>): Array<ControllerMethodMetadata> {

        return Reflect.getMetadata(METADATA_KEY.controllerMethod, constructor);
    }

    /**
     * Retrieve the constroller methods parameters metadata
     * @param constructor The controller constructor
     */
    public static getControllerParameterMetadata(constructor: any): ControllerParameterMetadata {

        return Reflect.getMetadata(METADATA_KEY.controllerParameter, constructor);
    }

    public static cleanUpMetadata() {

        Reflect.defineMetadata(METADATA_KEY.controller, [], Reflect);
    }

    /**
     * Checks if a value is an instance of the IHttpActionResult interface.
     * @param value The value to be checked
     */
    public static instanceOfIHttpActionResult(value: any): value is IHttpActionResult {
        return value != null && typeof value.executeAsync === "function";
    }
}
