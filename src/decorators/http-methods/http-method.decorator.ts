import { Middleware } from "../../core";
import { ControllerMethodMetadata, METADATA_KEY } from "../metadata";

/**
 * @methodDecorator
 * Listen to the specified method on a specific route. Used for obscure things that can't be done
 * with the shortcuts.
 * @param method The HTTP verb to listen to.
 * @param path The path of the method. Will include the controller path.
 * @param middleware A list of middleware specific to this method.
 */
export function HttpMethod(method: string, path: string, ...middleware: Middleware[]) {
    return function(target: any, key: string, value: any) {

        let metadata: ControllerMethodMetadata = {
            key: key,
            method: method,
            middleware: middleware,
            path: path,
            target: target
        };

        let metadataList: Array<ControllerMethodMetadata> = [];

        if (!Reflect.hasMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        }
        else {
            metadataList = Reflect.getMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }

        metadataList.push(metadata);
    };
}
