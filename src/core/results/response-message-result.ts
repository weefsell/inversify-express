import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class ResponseMessageResult implements IHttpActionResult {

    private message: HttpResponseMessage;

    private apiController: BaseHttpController<any>;

    constructor(message: HttpResponseMessage, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.message = message;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        return this.message;
    }
}
