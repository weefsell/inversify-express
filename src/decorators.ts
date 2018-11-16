import { inject, injectable, decorate } from "inversify";

import { interfaces } from "./interfaces";
import { TYPE, METADATA_KEY, PARAMETER_TYPE } from "./constants";

export const injectHttpContext = inject(TYPE.HttpContext);

export function Controller(path: string, ...middleware: interfaces.Middleware[]) {
    return function (target: any) {

        let currentMetadata: interfaces.ControllerMetadata = {
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
        const previousMetadata: interfaces.ControllerMetadata[] = Reflect.getMetadata(
            METADATA_KEY.controller,
            Reflect
        ) || [];

        const newMetadata = [currentMetadata, ...previousMetadata];

        Reflect.defineMetadata(
            METADATA_KEY.controller,
            newMetadata,
            Reflect
        );

    };
}

export function All(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("all", path, ...middleware);
}

export function HttpGet(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("get", path, ...middleware);
}

export function HttpPost(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("post", path, ...middleware);
}

export function HttpPut(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("put", path, ...middleware);
}

export function HttpPatch(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("patch", path, ...middleware);
}

export function HttpHead(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("head", path, ...middleware);
}

export function HttpDelete(path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return HttpMethod("delete", path, ...middleware);
}

export function HttpMethod(method: string, path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
    return function (target: any, key: string, value: any) {

        let metadata: interfaces.ControllerMethodMetadata = {
            key,
            method,
            middleware,
            path,
            target
        };

        let metadataList: interfaces.ControllerMethodMetadata[] = [];

        if (!Reflect.hasMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }

        metadataList.push(metadata);
    };
}

export function Request(): ParameterDecorator {
    return params(PARAMETER_TYPE.REQUEST);
}

export function RequestParam(paramName?: string): ParameterDecorator {
    return params(PARAMETER_TYPE.PARAMS, paramName);
}

export function Response(): ParameterDecorator {
    return params(PARAMETER_TYPE.RESPONSE);
}

export function QueryParam(queryParamName?: string): ParameterDecorator {
    return params(PARAMETER_TYPE.QUERY, queryParamName);
}

export function RequestBody(): ParameterDecorator {
    return params(PARAMETER_TYPE.BODY);
}

export function RequestHeaders(headerName: string): ParameterDecorator {
    return params(PARAMETER_TYPE.HEADERS, headerName);
}

export function Cookies(cookieName: string): ParameterDecorator {
    return params(PARAMETER_TYPE.COOKIES, cookieName);
}

export function Next(): ParameterDecorator {
    return params(PARAMETER_TYPE.NEXT)
}

export function Principal(): ParameterDecorator {
    return params(PARAMETER_TYPE.PRINCIPAL);
}

export function params(type: PARAMETER_TYPE, parameterName?: string) {
    return function (target: Object, methodName: string, index: number) {

        let metadataList: interfaces.ControllerParameterMetadata = {};
        let parameterMetadataList: interfaces.ParameterMetadata[] = [];
        let parameterMetadata: interfaces.ParameterMetadata = {
            index: index,
            injectRoot: parameterName === undefined,
            parameterName: parameterName,
            type: type
        };
        if (!Reflect.hasMetadata(METADATA_KEY.controllerParameter, target.constructor)) {
            parameterMetadataList.unshift(parameterMetadata);
        } else {
            metadataList = Reflect.getMetadata(METADATA_KEY.controllerParameter, target.constructor);
            if (metadataList.hasOwnProperty(methodName)) {
                parameterMetadataList = metadataList[methodName];
            }
            parameterMetadataList.unshift(parameterMetadata);
        }
        metadataList[methodName] = parameterMetadataList;
        Reflect.defineMetadata(METADATA_KEY.controllerParameter, metadataList, target.constructor);
    };
}
