
const { getPinconeResponse } = require('./pincone');

async function continueThread(messages) {
    const response = await getPinconeResponse(messages);
    return response;
}

module.exports = { continueThread }
