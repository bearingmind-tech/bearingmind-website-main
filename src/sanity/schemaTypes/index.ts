import { author } from "./author";
import { bookingSettings } from "./bookingSettings";
import { homePage } from "./homePage";
import { post } from "./post";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [siteSettings, homePage, bookingSettings, post, author];
export const singletonTypes = new Set(["siteSettings", "homePage", "bookingSettings"]);
