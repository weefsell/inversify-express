import { HttpContent } from "./http-content";

const DEFAULT_MEDIA_TYPE = "text/plain";

export class StringContent extends HttpContent {

    private content: string;

    private mediaType: string;

    constructor(content: string);
    constructor(content: string, mediaType: string);
    constructor(content: string, mediaType: string = DEFAULT_MEDIA_TYPE) {
        super();
        this.mediaType = mediaType;
        this.content = content;

        this.headers["content-type"] = mediaType;
    }

    public readAsStringAsync(): Promise<string> {
        return Promise.resolve(this.content);
    }
}
