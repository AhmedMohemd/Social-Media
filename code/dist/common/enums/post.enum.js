"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactEnum = exports.AvailabilityEnum = void 0;
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum[AvailabilityEnum["PUBLIC"] = 0] = "PUBLIC";
    AvailabilityEnum[AvailabilityEnum["FRIENDS"] = 1] = "FRIENDS";
    AvailabilityEnum[AvailabilityEnum["ONLY_ME"] = 2] = "ONLY_ME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var ReactEnum;
(function (ReactEnum) {
    ReactEnum["LIKE"] = "like";
    ReactEnum["LOVE"] = "love";
    ReactEnum["HAHA"] = "haha";
    ReactEnum["WOW"] = "wow";
    ReactEnum["SAD"] = "sad";
    ReactEnum["ANGRY"] = "angry";
})(ReactEnum || (exports.ReactEnum = ReactEnum = {}));
