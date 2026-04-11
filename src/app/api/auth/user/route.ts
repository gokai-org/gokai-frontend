import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";
import { apiConfig } from "@/shared/config";

export const dynamic = "force-dynamic";

function buildInvalidUserResponse() {
  const response = NextResponse.json(
    { user: null, error: "USER_NOT_FOUND" },
    {
      status: 410,
      headers: {
        "x-auth-invalid-user": "true",
        "x-auth-redirect": "landing",
      },
    },
  );

  response.cookies.set("gokai_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("gokai_profile", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      console.log("No token found");
      return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log("Decoding token to get user info");

    try {
      const tokenParts = token.split(".");

      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString(),
        );

        console.log("Token payload:", payload);

        const userId = payload.userId || payload.sub || payload.id;

        if (!userId) {
          console.error("No user ID found in token");
          return NextResponse.json({ user: null }, { status: 401 });
        }

        const response = await fetch(
          `${apiConfig.usersApiBase}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        console.log("Backend response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Error fetching user from backend:",
            response.status,
            errorText,
          );

          const invalidUserStatuses = new Set([401, 403, 404]);
          if (invalidUserStatuses.has(response.status)) {
            return buildInvalidUserResponse();
          }

          // Retry once — the users API may have had a transient failure.
          const retryResponse = await fetch(
            `${apiConfig.usersApiBase}/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              cache: "no-store",
            },
          ).catch(() => null);

          if (retryResponse?.ok) {
            const retryData = await retryResponse.json().catch(() => null);
            if (retryData) {
              const rfn = retryData.first_name || "";
              const rln = retryData.last_name || "";
              return NextResponse.json({
                user: {
                  id: retryData.id ?? userId,
                  email: retryData.email ?? payload.email ?? "",
                  firstName: rfn,
                  lastName: rln,
                  name: rfn && rln ? `${rfn} ${rln}` : rfn || retryData.email || "Usuario",
                  profile: retryData.profile,
                  plan: "free",
                  createdAt: retryData.created_at,
                  twoFactorEnabled: false,
                  points: typeof retryData.points === "number" ? retryData.points : 0,
                  kanaPoints:
                    typeof retryData.kana_points === "number"
                      ? retryData.kana_points
                      : 0,
                },
              });
            }
          }

          if (retryResponse && invalidUserStatuses.has(retryResponse.status)) {
            return buildInvalidUserResponse();
          }

          return NextResponse.json(
            { user: null, error: "USER_LOOKUP_FAILED" },
            { status: 503 },
          );
        }

        const userData = await response.json();
        console.log("User data from backend:", userData);

        const firstName = userData.first_name || "";
        const lastName = userData.last_name || "";

        let plan: "free" | "premium" | "pro" = "free";
        let subscribed = false;

        try {
          const subHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(userId ? { "X-User-Id": String(userId) } : {}),
            ...(payload?.email ? { "X-User-Email": String(payload.email) } : {}),
          };

          const subscriptionUrls = [
            `${apiConfig.subscriptionsApiBase}/subscriptions/${userId}`,
            `${apiConfig.subscriptionsApiBase}/subscriptions/me`,
          ];

          let subData: Record<string, unknown> | null = null;

          for (const url of subscriptionUrls) {
            const subRes = await fetch(url, {
              headers: subHeaders,
              cache: "no-store",
            });
            if (!subRes.ok) continue;

            subData = await subRes.json().catch(() => null);
            if (subData) break;
          }

          if (subData) {
            const status = String(subData.status ?? "").toLowerCase();
            const activeStatuses = new Set(["active", "trialing", "paid"]);

            if (activeStatuses.has(status)) {
              plan = "premium";
              subscribed = true;
            }
          }
        } catch (subErr) {
          console.error("Error checking subscription:", subErr);
        }

        const user = {
          id: userData.id,
          email: userData.email,
          firstName,
          lastName,
          name:
            firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName || userData.email,
          birthdate: userData.birthdate,
          profile: userData.profile,
          avatar: null,
          plan,
          createdAt: userData.created_at,
          subscribed,
          twoFactorEnabled: false,
          points: typeof userData.points === "number" ? userData.points : 0,
          kanaPoints:
            typeof userData.kanaPoints === "number"
              ? userData.kanaPoints
              : typeof userData.kana_points === "number"
                ? userData.kana_points
                : 0,
        };

        return NextResponse.json({ user });
      }
    } catch (tokenError) {
      console.error("Error parsing token:", tokenError);
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: null }, { status: 500 });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { user: null, error: "Error al obtener usuario" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH /api/auth/user called");

    const token = getTokenFromRequest(request);

    if (!token) {
      console.log("No token found");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    const userId = payload.userId || payload.sub || payload.id;

    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo obtener el ID del usuario" },
        { status: 401 },
      );
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
    } = {};

    if (body.firstName !== undefined) {
      updateData.firstName = body.firstName;
    }

    if (body.lastName !== undefined) {
      updateData.lastName = body.lastName;
    }

    if (body.name && !body.firstName && !body.lastName) {
      const nameParts = body.name.trim().split(" ");
      updateData.firstName = nameParts[0];

      if (nameParts.length > 1) {
        updateData.lastName = nameParts.slice(1).join(" ");
      }
    }

    console.log("Updating user with data:", updateData);
    console.log(
      "Calling backend URL:",
      `${apiConfig.usersApiBase}/users/${userId}`,
    );

    const response = await fetch(`${apiConfig.usersApiBase}/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating user:", response.status, errorText);

      return NextResponse.json(
        { error: "Error al actualizar perfil" },
        { status: response.status },
      );
    }

    const userData = await response.json();
    console.log("Updated user data:", userData);

    const firstName = userData.firstName || userData.first_name || "";
    const lastName = userData.lastName || userData.last_name || "";

    const user = {
      id: userData.id,
      email: userData.email,
      firstName,
      lastName,
      name:
        firstName && lastName
          ? `${firstName} ${lastName}`
          : firstName || userData.email,
      birthdate: userData.birthdate,
      profile: userData.profile,
      avatar: null,
      plan: "free",
      createdAt: userData.createdAt || userData.created_at,
      twoFactorEnabled: false,
      points:
        typeof userData.points === "number"
          ? userData.points
          : 0,
      kanaPoints:
        typeof userData.kanaPoints === "number"
          ? userData.kanaPoints
          : typeof userData.kana_points === "number"
            ? userData.kana_points
            : 0,
    };

    console.log("Frontend will receive user:", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await fetch(`${apiConfig.usersApiBase}/users/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Error al eliminar cuenta" },
      { status: 500 },
    );
  }
}
