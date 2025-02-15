import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { isAuthenticated, data } = await request.json();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  if (!data) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("submissions");

    // Insert the data into the database
    const result = await collection.insertOne({ data });

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}