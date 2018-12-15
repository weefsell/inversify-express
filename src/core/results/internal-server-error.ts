import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import { HttpResponseMessage } from "../http-response-message";
import { BaseHttpController } from "../base-http-controller";
import { IHttpActionResult } from "./http-action-result.interface";

export class InternalServerErrorResult implements IHttpActionResult {

    private apiController: BaseHttpController<any>;

    constructor(apiController: BaseHttpController<any>) {

        this.apiController = apiController;
    }

    public async executeAsync(): Promise<HttpResponseMessage> {

        return new HttpResponseMessage(INTERNAL_SERVER_ERROR);
    }
}
