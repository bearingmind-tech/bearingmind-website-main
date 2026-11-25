import { author } from "./author";
import { bookingSettings } from "./bookingSettings";
import { homePage } from "./homePage";
import { landingPage } from "./landingPage";
import { post } from "./post";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [siteSettings, homePage, bookingSettings, landingPage, post, author];
export const singletonTypes = new Set(["siteSettings", "homePage", "bookingSettings"]);
