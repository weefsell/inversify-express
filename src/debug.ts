import { interfaces as inversifyInterfaces } from "inversify";

import { PARAMETER_TYPE } from "./constants";
import { Util } from "./util";
import {
    ControllerMetadata,
    ControllerMethodMetadata,
    ControllerParameterMetadata
} from "./decorators/metadata";
import { BaseHttpController } from "./core";

export function getRouteInfo(container: inversifyInterfaces.Container) {

    const raw = getRawMetadata(container);

    return raw.map((r: any) => {

        const controllerId = r.controllerMetadata.target.name;

        const endpoints = r.methodMetadata.map((m: any) => {

            const method = m.method.toUpperCase();
            const controllerPath = r.controllerMetadata.path;
            const actionPath = m.path;
            const paramMetadata = r.parameterMetadata;
            let args: string[] | undefined = undefined;

            if (paramMetadata !== undefined) {
                const paramMetadataForKey = paramMetadata[m.key] || undefined;
                if (paramMetadataForKey) {
                    args = (r.parameterMetadata[m.key] || []).map((a: any) => {
                        let type = "";
                        switch (a.type) {
                            case PARAMETER_TYPE.RESPONSE:
                                type = "@Response";
                                break;
                            case PARAMETER_TYPE.REQUEST:
                                type = "@Request";
                                break;
                            case PARAMETER_TYPE.NEXT:
                                type = "@Next";
                                break;
                            case PARAMETER_TYPE.PARAMS:
                                type = "@RequestParam";
                                break;
                            case PARAMETER_TYPE.QUERY:
                                type = "QueryParam";
                                break;
                            case PARAMETER_TYPE.BODY:
                                type = "@RequestBody";
                                break;
                            case PARAMETER_TYPE.HEADERS:
                                type = "@RequestHeaders";
                                break;
                            case PARAMETER_TYPE.COOKIES:
                                type = "@Cookies";
                                break;
                            case PARAMETER_TYPE.PRINCIPAL:
                                type = "@PrincipalUser";
                                break;
                        }
                        return `${type} ${a.parameterName}`;
                    });
                }
            }

            const details = {
                route: `${method} ${controllerPath}${actionPath}`
            };

            if (args) {
                details["args"] = args;
            }

            return details as { route: string, args?: string[] };

        });

        return {
            controller: controllerId,
            endpoints: endpoints
        };

    });

}

export function getRawMetadata(container: inversifyInterfaces.Container) {

    const controllers = Util.getControllersFromContainer(container, true);

    return controllers.map((controller: BaseHttpController<any>) => {

        let constructor = controller.constructor as inversifyInterfaces.Newable<BaseHttpController>;
        let controllerMetadata: ControllerMetadata = Util.getControllerMetadata(constructor);
        let methodMetadata: Array<ControllerMethodMetadata> = Util.getControllerMethodMetadata(constructor);
        let parameterMetadata: ControllerParameterMetadata = Util.getControllerParameterMetadata(constructor);

        return {
            controllerMetadata,
            methodMetadata,
            parameterMetadata
        };

    });

}


