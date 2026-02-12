import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/shared/lib/auth/cookies";

export const dynamic = "force-dynamic";

const USERS_API_BASE = process.env.GOKAI_USERS_API_BASE || "http://localhost:8082";

export async function PATCH(request: NextRequest) {
  console.log("PATCH /api/auth/user/profile called");
  
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      console.error("No token found");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    
    const { name, email, firstName, lastName, birthdate } = body;

    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (!firstName && name) {
      const nameParts = name.trim().split(" ");
      finalFirstName = nameParts[0] || "";
      finalLastName = nameParts.slice(1).join(" ") || "";
    }

    if (!finalFirstName && !email && !birthdate) {
      return NextResponse.json({ error: "Debe proporcionar al menos un campo para actualizar" }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const updateData: any = {};
    if (finalFirstName) {
      updateData.first_name = finalFirstName;
      if (finalLastName) updateData.last_name = finalLastName;
    }
    if (email) updateData.email = email;
    if (birthdate) updateData.birthdate = birthdate;

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.userId || payload.sub || payload.id;
    
    if (!userId) {
      return NextResponse.json({ error: "No se pudo obtener el ID del usuario" }, { status: 401 });
    }

    const response = await fetch(`${USERS_API_BASE}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error al actualizar perfil" }));
      return NextResponse.json(
        { error: errorData.error || "Error al actualizar perfil" },
        { status: response.status }
      );
    }

    const updatedUser = await response.json();

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
