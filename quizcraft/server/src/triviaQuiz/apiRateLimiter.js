const Mutex = require('async-mutex').Mutex;

/**
 * This static class is responsible for restricting API calls: Only allow to make one every 5 seconds.
 * This is done since the Trivia Database API limits the server's IP address to only allow a single API call within 5 seconds.
 */
class ApiRateLimiter {
    //  mutex used to lock updateLastApiCall and canMakeApiCall from outside of this class.
    static mutex = new Mutex();
    static lastApiCallTimestamp;
    static timeBetweenApiCalls = 5000; // 5 seconds

    constructor() {
        if (this instanceof ApiRateLimiter) {
            throw Error("ApiRateLimiter is a static class. It cannot be instantiated.");
        }
    }

    /**
     * Updates ApiRateLimiter.lastApiCallTimestamp. Needs locking via ApiRateLimit.mutex!
     */
    static updateLastApiCallTimeStamp() {
        this.lastApiCallTimestamp = Date.now();
    }

    /**
     * Accesses ApiRateLimiter.lastApiCallTimestamp. Needs locking via ApiRateLimit.mutex!
     */
    static canMakeApiCall() {
        const isFirstRequest = !this.lastApiCallTimestamp;
        const enoughTimeSinceLastRequest = Date.now() - this.lastApiCallTimestamp > this.timeBetweenApiCalls
        return isFirstRequest || enoughTimeSinceLastRequest;
    }
}

module.exports = ApiRateLimiter;