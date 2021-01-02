module.exports.util = {}

module.exports.util.sleep = function (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
