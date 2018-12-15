import { HttpResponseMessage } from "../http-response-message";

export interface IHttpActionResult {
    executeAsync(): Promise<HttpResponseMessage>;
}
