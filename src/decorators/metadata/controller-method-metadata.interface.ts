import { ControllerMetadata } from "./controller-metadata.interface";

export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
}
