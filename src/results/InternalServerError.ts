import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import { HttpResponseMessage } from "../httpResponseMessage";
import { interfaces } from "../interfaces";
import { BaseHttpController } from "../base_http_controller";

export default class InternalServerErrorResult implements interfaces.IHttpActionResult {
    constructor(private apiController: BaseHttpController) {}

    public async executeAsync() {
        return new HttpResponseMessage(INTERNAL_SERVER_ERROR);
    }
}
