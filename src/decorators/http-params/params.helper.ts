import { PARAMETER_TYPE } from "../../constants";
import { ControllerParameterMetadata, METADATA_KEY, ParameterMetadata } from "../metadata";

/**
 * @privateApi
 * Decorator factory function used by http-params decorators
 * @param type The type of the param in the request.
 * @param parameterName The name of the parameter.
 */
export function params(type: PARAMETER_TYPE, parameterName?: string) {

    return function(target: Object, methodName: string, index: number) {

        const parameterMetadata: ParameterMetadata = {
            index: index,
            injectRoot: parameterName === undefined,
            parameterName: parameterName,
            type: type
        };

        let metadataList: ControllerParameterMetadata = {};
        let parameterMetadataList: Array<ParameterMetadata> = [];


        if (!Reflect.hasMetadata(METADATA_KEY.controllerParameter, target.constructor)) {

            parameterMetadataList.unshift(parameterMetadata);
        }
        else {

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
