import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the user principal obtained from the AuthProvider.
 */
export function Principal(): ParameterDecorator {
    return params(PARAMETER_TYPE.PRINCIPAL);
}
