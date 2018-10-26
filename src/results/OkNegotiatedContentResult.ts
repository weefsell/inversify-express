import { OK } from "http-status-codes";

import { HttpResponseMessage } from "../httpResponseMessage";
import { interfaces } from "../interfaces";
import { BaseHttpController } from "../base_http_controller";
import { StringContent } from "../content/stringContent";

export default class OkNegotiatedContentResult<T> implements interfaces.IHttpActionResult {
    constructor(private content: T, private apiController: BaseHttpController) {}

    public async executeAsync() {
        const response = new HttpResponseMessage(OK);
        response.content = new StringContent(JSON.stringify(this.content), "application/json");
        return response;
    }
}
