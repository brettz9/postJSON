export default postJSON;
export type JSONPrimitive = null | boolean | number | string;
export type JSONObject = {
    [member: string]: JSON;
};
export type JSONArray = Array<JSON>;
export type JSON = JSONPrimitive | JSONObject | JSONArray;
export type StatusHandler = (response: Response) => Promise<Response>;
export type RetrievalHandler = (response: Response) => JSON | Promise<JSON>;
/**
 * The keys are header names and the values their values.
 */
export type Headers = Record<string, string>;
export type AnyValue = any;
export type PostJSONErrback = (Any: Error) => AnyValue;
export type PostJSONCallback = (result: AnyValue) => JSON | Promise<JSON>;
export type PostJSONOptions = {
    body?: JSON | undefined;
    url?: string | undefined;
    callback?: PostJSONCallback | undefined;
    errBack?: PostJSONErrback | undefined;
    status?: StatusHandler | undefined;
    retrieval?: RetrievalHandler | undefined;
    /**
     * "omit" is `fetch` default
     */
    credentials?: "omit" | "same-origin" | "include" | undefined;
    headers?: Record<string, string> | undefined;
};
/**
 * The keys are header names and the values their values.
 * @typedef {Record<string, string>} Headers
*/
/**
 * @typedef {any} AnyValue
 */
/**
* @callback PostJSONErrback
* @param {Error} Any error caught during `fetch`, {@link StatusHandler},
*   {@link RetrievalHandler}, or, if present, {@link PostJSONCallback}.
* @returns {AnyValue} Its return will serve as the return of `postJSON` in the
*   event of it catching an error.
*/
/**
* @callback PostJSONCallback
* @param {AnyValue} result The result of `postJSON`'s {@link RetrievalHandler}
*   (by default {@link retrievalJSON})
* @returns {JSON|Promise<JSON>} Any promise will feed into `errBack` if present.
*   This value will serve as the `postJSON` return result.
*/
/**
* @typedef {object} PostJSONOptions
* @property {JSON} [body]
* @property {string} [url]
* @property {PostJSONCallback} [callback]
* @property {PostJSONErrback} [errBack]
* @property {StatusHandler} [status=statusOK]
* @property {RetrievalHandler} [retrieval=retrievalJSON]
* @property {"omit"|"same-origin"|"include"} [credentials="same-origin"]
*   "omit" is `fetch` default
* @property {Headers} [headers={"Accept": "application/json","Content-Type": "application/json"}]
*/
/**
 *
 * @param {string|PostJSONOptions} [url]
 * @param {JSON} [bodyObject] Will be overridden by `url.body` if present
 * @param {PostJSONCallback} [cb]
 * @param {PostJSONErrback} [errBack]
 * @returns {Promise<AnyValue>}
 */
declare function postJSON(url?: string | PostJSONOptions, bodyObject?: JSON, cb?: PostJSONCallback, errBack?: PostJSONErrback): Promise<AnyValue>;
declare namespace postJSON {
    export { retrievalJSON as retrieval };
    export { statusOK as status };
}
declare function retrievalJSON(response: Response): JSON | Promise<JSON>;
declare function statusOK(response: Response): Promise<Response>;
//# sourceMappingURL=index.d.ts.map