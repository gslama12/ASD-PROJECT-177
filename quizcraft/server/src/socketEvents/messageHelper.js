
function constructErrorResponse(message) {
    return {
        error: {
            message: message,
        }
    };
}

function constructDataResponse(data) {
    return {
        data: data
    };
}


module.exports = {
    constructErrorResponse,
    constructDataResponse
};