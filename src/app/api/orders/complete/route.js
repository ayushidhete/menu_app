// app/api/orders/complete/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnnect";
import Order from "@/models/schema.js";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await dbConnect(); // ensure mongoose is connected

    const { table_no } = await req.json();
    if (!table_no) {
      return NextResponse.json({ error: "Missing table_no" }, { status: 400 });
    }

    // find and delete active order
    const removed = await Order.findOneAndDelete({ table_no });
    if (!removed) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // prepare archived doc (safe plain object)
    const archived = { ...removed.toObject(), completedAt: new Date() };

    // Use mongoose.connection.db which is available after dbConnect()
    const db = mongoose.connection.db;
    if (!db) {
      console.error("mongoose.connection.db is not available");
      // still return success for deletion but warn
      return NextResponse.json(
        { message: "Order deleted but archive failed (no DB handle)" },
        { status: 200 }
      );
    }

    await db.collection("orders_history").insertOne(archived);

    return NextResponse.json({ message: "Order archived & deleted" }, { status: 200 });
  } catch (err) {
    console.error("Error completing order:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
