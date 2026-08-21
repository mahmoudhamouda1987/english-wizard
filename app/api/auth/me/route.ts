import { NextResponse } from "next/server";import { currentUser } from "@/src/infrastructure/auth";export async function GET(){const user=await currentUser();return NextResponse.json({user});}
