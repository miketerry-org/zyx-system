// renderPayload.js:

"use strict";

/**
 * Formats a payload for rendering a response.
 *
 * @param {number} code - The HTTP status code.
 * @param {string} template - The name of the template file to render.
 * @param {object|string} data - The data payload or an error message.
 * @returns {{ code: number, template: string, data: object }}
 */
function renderPayload(code, template, data) {
  // if data is a string, convert to object with error message, if data is undefined then return empty object else return data
  const normalizedData =
    typeof data === "string" ? { error: data } : data || {};

  // pack and return parameters into an bobject
  return {
    code,
    template,
    data: normalizedData,
  };
}

module.exports = renderPayload;
