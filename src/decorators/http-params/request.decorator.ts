import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the request object.
 */
export function Request(): ParameterDecorator {
    return params(PARAMETER_TYPE.REQUEST);
}
