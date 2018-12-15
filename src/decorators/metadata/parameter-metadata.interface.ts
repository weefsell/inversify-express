import { PARAMETER_TYPE } from "../../constants";

export interface ParameterMetadata {
    parameterName?: string;
    injectRoot: boolean;
    index: number;
    type: PARAMETER_TYPE;
}
