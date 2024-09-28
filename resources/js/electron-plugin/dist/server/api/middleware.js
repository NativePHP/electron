"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(secret) {
    return function (req, res, next) {
        if (req.headers['x-nativephp-secret'] !== secret) {
            res.sendStatus(403);
            return;
        }
        next();
    };
}
exports.default = default_1;
