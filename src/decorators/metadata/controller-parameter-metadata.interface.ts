import { ParameterMetadata } from "./parameter-metadata.interface";

export interface ControllerParameterMetadata {
    [methodName: string]: ParameterMetadata[];
}
