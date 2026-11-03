import { ENV, REFRESH_COOKIE_MAX_AGE } from "../config/config.js"

const AccessTokenCookieOptions = () => {

}

const RefreshTokenCookieOptions = () => {
     const isProduction = ENV === 'production' || ENV === 'Production';

     return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: Number(REFRESH_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
        path: "/"
     };
}

export const StoreRefreshCookie = (res, token) => {
   res.cookie("REFRESH_TOKEN", token, RefreshTokenCookieOptions());
}

export const ClearRefreshCookie = (res) => {
   res.clearCookie("REFRESH_TOKEN", { path: "/" });
}
