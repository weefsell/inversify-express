import { BaseHttpController } from "../base-http-controller";
import { HttpResponseMessage } from "../http-response-message";
import { IHttpActionResult } from "./http-action-result.interface";

export class StatusCodeResult implements IHttpActionResult {

    private statusCode: number;

    private apiController: BaseHttpController<any>;

    constructor(statusCode: number, apiController: BaseHttpController<any>) {

        this.apiController = apiController;
        this.statusCode = statusCode;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {
        return new HttpResponseMessage(this.statusCode);
    }
}
