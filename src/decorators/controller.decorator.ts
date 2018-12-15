import { decorate, injectable, interfaces as inversifyInterfaces } from "inversify";

import { BaseHttpController, Middleware } from "../core";
import { ControllerMetadata, METADATA_KEY } from "./metadata";

/**
 * @classDecorator
 * Registers the decorated class as a controller with a root path, and optionally registers any
 * global middleware for this controller.
 * @param path The path of this controller (e.g. "/products", "/accounts")/
 * @param middleware A list of middleware to run on every request.
 */
export function Controller(path: string, ...middleware: Middleware[]) {

    return function(target: inversifyInterfaces.Newable<BaseHttpController>) {

        let currentMetadata: ControllerMetadata = {
            middleware: middleware,
            path: path,
            target: target
        };

        decorate(injectable(), target);
        Reflect.defineMetadata(METADATA_KEY.controller, currentMetadata, target);

        // We need to create an array that contains the metadata of all
        // the controllers in the application, the metadata cannot be
        // attached to a controller. It needs to be attached to a global
        // We attach metadata to the Reflect object itself to avoid
        // declaring additonal globals. Also, the Reflect is avaiable
        // in both node and web browsers.
        const previousMetadata: ControllerMetadata[] = Reflect.getMetadata(METADATA_KEY.controller, Reflect) || [];

        const newMetadata = [currentMetadata, ...previousMetadata];

        Reflect.defineMetadata(METADATA_KEY.controller, newMetadata, Reflect);
    };
}
