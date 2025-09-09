import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnnect";
import Order from "@/models/schema.js";
import Pusher from "pusher";

export const runtime = "nodejs";

const pusher = (() => {
  try {
    if (!process.env.PUSHER_KEY) return null;
    return new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  } catch (e) {
    console.error("Pusher initialization failed:", e);
    return null;
  }
})();

export async function GET(req, { params }) {
  const { table } = await params;
  try {
    await dbConnect();
    const res = await Order.findOne({ table_no: table });
    // return message: null when not found (keeps compatibility with your frontend)
    return NextResponse.json({ message: res ?? null }, { status: 200 });
  } catch (err) {
    console.error("Error Getting Order by Table Number", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { table } = params;
  try {
    await dbConnect();
    const body = await req.json();
    const { items, total, status } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate(
      { table_no: table },
      { $set: { item: items, total, status: status ?? "pending" } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const payload = {
      _id: updated._id.toString(),
      table_no: updated.table_no,
      item: updated.item,
      total: updated.total,
      status: updated.status,
      createdAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
    };

    if (pusher) {
      pusher
        .trigger("food-orders", "Order-Updated", payload)
        .catch((e) => console.error("Pusher update error (non-fatal):", e));
    } else {
      console.log("Pusher not configured — skipped trigger for Order-Updated");
    }

    return NextResponse.json({ message: "Order updated", order: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT order error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { table } = params;
  try {
    await dbConnect();
    const deleted = await Order.findOneAndDelete({ table_no: table });
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (pusher) {
      pusher
        .trigger("food-orders", "Order-Deleted", {
          table_no: deleted.table_no,
          _id: deleted._id.toString(),
        })
        .catch((e) => console.error("Pusher delete error (non-fatal):", e));
    } else {
      console.log("Pusher not configured — skipped trigger for Order-Deleted");
    }

    return NextResponse.json({ message: "Deleted", order: deleted }, { status: 200 });
  } catch (err) {
    console.error("DELETE order error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
