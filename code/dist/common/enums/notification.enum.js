"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTypeEnum = void 0;
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["POST_LIKE"] = "post_like";
    NotificationTypeEnum["POST_COMMENT"] = "post_comment";
    NotificationTypeEnum["POST_MENTION"] = "post_mention";
    NotificationTypeEnum["COMMENT_LIKE"] = "comment_like";
    NotificationTypeEnum["COMMENT_REPLY"] = "comment_reply";
    NotificationTypeEnum["FRIEND_REQUEST"] = "friend_request";
    NotificationTypeEnum["FRIEND_ACCEPT"] = "friend_accept";
    NotificationTypeEnum["STORY_VIEW"] = "story_view";
    NotificationTypeEnum["SYSTEM"] = "system";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
