import { NextRequest, NextResponse } from "next/server";

const PATREON_TIER_IDS = JSON.parse(process.env.PATREON_TIER_IDS!) as string[];

type PatreonToken = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
};

function postToken(code: string, redirectURI: string) {
  return fetch("https://www.patreon.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_PATREON_CLIENT_ID_V2!,
      client_secret: process.env.PATREON_CLIENT_SECRET_V2!,
      redirect_uri: redirectURI,
    }),
  });
}

function postRefreshToken(refreshToken: string) {
  return fetch("https://www.patreon.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_PATREON_CLIENT_ID_V2!,
      client_secret: process.env.PATREON_CLIENT_SECRET_V2!,
    }),
  });
}

function getCurrentUser(token: PatreonToken) {
  return fetch(
    `https://www.patreon.com/api/oauth2/v2/identity?include=memberships.currently_entitled_tiers`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );
}

function isSupporter(currentUser: any) {
  return currentUser.included.some((data: any) => {
    return data.relationships?.currently_entitled_tiers?.data.some(
      (tier: any) => PATREON_TIER_IDS.includes(tier.id)
    );
  });
}

function toCookieString(token: PatreonToken) {
  return `patreon_token=${JSON.stringify(
    token
  )}; path=/; Max-Age=2592000; HttpOnly; SameSite=Lax;`;
}

function toCookieStringEmpty() {
  return `patreon_token=; Max-Age=0; path=/; HttpOnly; SameSite=Lax;`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  if (!requestBody.code || !requestBody.redirectURI) {
    return NextResponse.json(
      { error: "No code provided" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  const tokenResponse = await postToken(
    requestBody.code,
    requestBody.redirectURI
  );
  const tokenResult = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return NextResponse.json(tokenResult, {
      status: tokenResponse.status,
      headers: CORS_HEADERS,
    });
  }
  const token = tokenResult as PatreonToken;
  const currentUserResponse = await getCurrentUser(token);
  const currentUserResult = await currentUserResponse.json();
  if (!currentUserResponse.ok) {
    return NextResponse.json(currentUserResult, {
      status: currentUserResponse.status,
      headers: {
        ...CORS_HEADERS,
        "Set-Cookie": toCookieStringEmpty(),
      },
    });
  }

  if (!isSupporter(currentUserResult)) {
    return NextResponse.json(
      { error: "User is not a patron", data: currentUserResult },
      {
        status: 403,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": toCookieStringEmpty(),
        },
      }
    );
  }

  return NextResponse.json(
    { success: true },
    {
      status: currentUserResponse.status,
      headers: {
        ...CORS_HEADERS,
        "Set-Cookie": toCookieString(token),
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const patreonToken = request.cookies.get("patreon_token");
  if (!patreonToken) {
    return NextResponse.json(
      { error: "Token expired" },
      {
        status: 498,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": toCookieStringEmpty(),
        },
      }
    );
  }
  try {
    const oldToken = JSON.parse(patreonToken.value) as PatreonToken;
    const refreshTokenResponse = await postRefreshToken(oldToken.refresh_token);

    const refreshTokenResult = await refreshTokenResponse.json();
    if (!refreshTokenResponse.ok) {
      return NextResponse.json(refreshTokenResult, {
        status: refreshTokenResponse.status,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": toCookieStringEmpty(),
        },
      });
    }
    const token = refreshTokenResult as PatreonToken;

    const currentUserResponse = await getCurrentUser(token);
    const currentUserResult = await currentUserResponse.json();
    if (!currentUserResponse.ok) {
      return NextResponse.json(currentUserResult, {
        status: currentUserResponse.status,
        headers: CORS_HEADERS,
      });
    }

    if (!isSupporter(currentUserResult)) {
      return NextResponse.json(
        { error: "User is not a patron", currentUserResult },
        {
          status: 403,
          headers: {
            ...CORS_HEADERS,
            "Set-Cookie": toCookieStringEmpty(),
          },
        }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        status: currentUserResponse.status,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": toCookieString(token),
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Token invalid" },
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": toCookieStringEmpty(),
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
