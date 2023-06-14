import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "./app/lib/i18n";

const COOKIE_NAME = "i18next";

function getUserLanguage(req: NextRequest) {
  if (req.cookies.has(COOKIE_NAME)) {
    const cookie = req.cookies.get(COOKIE_NAME)!.value;
    if (LOCALES.includes(cookie)) {
      return cookie;
    }
  }
  return DEFAULT_LOCALE;
}

function getPathLanguage(pathname: string) {
  const [, pathLanguage] = pathname.match(/\/(\w+)\/?/) ?? [];
  if (pathLanguage && LOCALES.includes(pathLanguage)) {
    return pathLanguage;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const userLanguage = getUserLanguage(req);
  const pathLanguage = getPathLanguage(req.nextUrl.pathname);
  if (pathLanguage) {
    let res: NextResponse<unknown>;
    if (pathLanguage === DEFAULT_LOCALE) {
      const path = req.nextUrl.pathname.replace(`/${pathLanguage}`, "") || "/";
      res = NextResponse.redirect(new URL(path + req.nextUrl.search, req.url));
    } else {
      res = NextResponse.next();
    }
    if (req.nextUrl.pathname === `/${pathLanguage}`) {
      res.cookies.set(COOKIE_NAME, pathLanguage, {
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }
  } else if (userLanguage !== DEFAULT_LOCALE) {
    return NextResponse.redirect(
      new URL(
        `/${userLanguage}${req.nextUrl.pathname}${req.nextUrl.search}`,
        req.url
      )
    );
  }
}

export const config = {
  matcher: [
    "/",
    "/en",
    "/de",
    "/fr",
    "/ru",
    "/es",
    "/en/(nodes/.*)",
    "/de/(nodes/.*)",
    "/fr/(nodes/.*)",
    "/ru/(nodes/.*)",
    "/es/(nodes/.*)",
    "/(nodes/.*)",
  ],
};
