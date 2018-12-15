import { PARAMETER_TYPE } from "../../constants";
import { params } from "./params.helper";

/**
 * @paramDecorator
 * Binds a method parameter to the request cookies.
 * @param cookieName The name of the cookie.
 */
export function Cookies(cookieName: string): ParameterDecorator {
    return params(PARAMETER_TYPE.COOKIES, cookieName);
}
