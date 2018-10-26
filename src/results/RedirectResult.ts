import { MOVED_TEMPORARILY } from "http-status-codes";
import { URL } from "url";

import { HttpResponseMessage } from "../httpResponseMessage";
import { interfaces } from "../interfaces";
import { BaseHttpController } from "../base_http_controller";

export default class RedirectResult implements interfaces.IHttpActionResult {
    constructor(private location: string | URL, private apiController: BaseHttpController) {}

    public async executeAsync() {
        const response = new HttpResponseMessage(MOVED_TEMPORARILY);
        response.headers.location = this.location.toString();
        return response;
    }
}
