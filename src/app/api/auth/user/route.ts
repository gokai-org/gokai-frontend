import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";

export const dynamic = "force-dynamic";

const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      console.log("No token found");
      return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log("Decoding token to get user info");

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log("Token payload:", payload);
        
        const userId = payload.userId || payload.sub || payload.id;
        
        if (!userId) {
          console.error("No user ID found in token");
          return NextResponse.json({ user: null }, { status: 401 });
        }

        const response = await fetch(`${USERS_API_BASE}/users/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        console.log("Backend response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching user from backend:", response.status, errorText);
          
          const user = {
            id: userId,
            email: payload.email || "",
            name: payload.email || "Usuario",
            plan: "free",
            createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : undefined,
            twoFactorEnabled: false,
          };
          
          return NextResponse.json({ user });
        }

        const userData = await response.json();
        console.log("User data from backend:", userData);

        const firstName = userData.first_name || "";
        const lastName = userData.last_name || "";
        
        const user = {
          id: userData.id,
          email: userData.email,
          firstName: firstName,
          lastName: lastName,
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || userData.email,
          birthdate: userData.birthdate,
          profile: userData.profile,
          avatar: null,
          plan: "free",
          createdAt: userData.created_at,
          twoFactorEnabled: false,
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
    return NextResponse.json({ user: null, error: "Error al obtener usuario" }, { status: 500 });
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

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.userId || payload.sub || payload.id;
    
    if (!userId) {
      return NextResponse.json({ error: "No se pudo obtener el ID del usuario" }, { status: 401 });
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
      const nameParts = body.name.trim().split(' ');
      updateData.firstName = nameParts[0];
      if (nameParts.length > 1) {
        updateData.lastName = nameParts.slice(1).join(' ');
      }
    }

    // El backend aún no soporta actualizar email y birthdate
    // if (body.email !== undefined) {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(body.email)) {
    //     return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    //   }
    //   updateData.email = body.email;
    // }
    // if (body.birthdate !== undefined) {
    //   updateData.birthdate = body.birthdate;
    // }

    console.log("Updating user with data:", updateData);
    console.log("Calling backend URL:", `${USERS_API_BASE}/users/${userId}`);

    const response = await fetch(`${USERS_API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating user:", response.status, errorText);
      return NextResponse.json(
        { error: "Error al actualizar perfil" }, 
        { status: response.status }
      );
    }

    const userData = await response.json();
    console.log("Updated user data:", userData);

    const firstName = userData.firstName || userData.first_name || "";
    const lastName = userData.lastName || userData.last_name || "";
    
    const user = {
      id: userData.id,
      email: userData.email,
      firstName: firstName,
      lastName: lastName,
      name: firstName && lastName ? `${firstName} ${lastName}` : firstName || userData.email,
      birthdate: userData.birthdate,
      profile: userData.profile,
      avatar: null,
      plan: "free",
      createdAt: userData.createdAt || userData.created_at,
      twoFactorEnabled: false,
    };

    console.log("Frontend will receive user:", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await fetch(`${USERS_API_BASE}/users/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Error al eliminar cuenta" }, { status: 500 });
  }
}
