import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnnect";
import mongoose from "mongoose";

export const runtime = "nodejs";

function formatDateISO(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days")) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const db = mongoose.connection.db;
    if (!db) throw new Error("DB connection unavailable");

    const coll = db.collection("orders_history");

    const kpiPipeline = [
      { $match: { completedAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$total", 0] } },
          hourCounts: { $push: { $hour: "$completedAt" } },
          dayCounts: { $push: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } } },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          revenue: 1,
          avgOrderValue: { $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $round: [{ $divide: ["$revenue", "$totalOrders"] }, 2] }] },
          hourCounts: 1,
          dayCounts: 1,
        },
      },
    ];

    const kpiResult = await coll.aggregate(kpiPipeline).toArray();
    const kpiRaw = kpiResult[0] || { totalOrders: 0, revenue: 0, avgOrderValue: 0, hourCounts: [], dayCounts: [] };

    const hourCountsMap = {};
    for (const h of kpiRaw.hourCounts || []) {
      hourCountsMap[h] = (hourCountsMap[h] || 0) + 1;
    }
    let peakHour = null;
    let peakHourCount = -1;
    for (const [h, c] of Object.entries(hourCountsMap)) {
      if (c > peakHourCount) {
        peakHourCount = c;
        peakHour = h;
      }
    }

    const dayCountsMap = {};
    for (const d of kpiRaw.dayCounts || []) {
      dayCountsMap[d] = (dayCountsMap[d] || 0) + 1;
    }
    let peakDay = null;
    let peakDayCount = -1;
    for (const [d, c] of Object.entries(dayCountsMap)) {
      if (c > peakDayCount) {
        peakDayCount = c;
        peakDay = d;
      }
    }

    const seriesPipeline = [
      { $match: { completedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$total", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ];
    const seriesRaw = await coll.aggregate(seriesPipeline).toArray();
    const seriesMap = seriesRaw.reduce((acc, cur) => {
      acc[cur._id] = { orders: cur.orders, revenue: cur.revenue };
      return acc;
    }, {});
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateISO(d);
      series.push({
        date: key,
        orders: (seriesMap[key] && seriesMap[key].orders) || 0,
        revenue: (seriesMap[key] && seriesMap[key].revenue) || 0,
      });
    }

    const catPipeline = [
      { $match: { completedAt: { $gte: since } } },
      { $unwind: "$item" },
      {
        $group: {
          _id: { $ifNull: ["$item.category", "Unspecified"] },
          qty: { $sum: { $ifNull: ["$item.qty", 1] } },
          revenue: { $sum: { $multiply: [{ $ifNull: ["$item.qty", 1] }, { $ifNull: ["$item.price", 0] }] } },
        },
      },
      { $sort: { revenue: -1 } },
    ];
    const catRaw = await coll.aggregate(catPipeline).toArray();
    const categoryBreakdown = catRaw.map((r) => ({ name: r._id, value: r.qty, revenue: r.revenue }));

    const recent = await coll
      .find({ completedAt: { $gte: since } })
      .sort({ completedAt: -1 })
      .limit(50)
      .toArray();

    const kpis = {
      totalOrders: kpiRaw.totalOrders || 0,
      revenue: kpiRaw.revenue || 0,
      avgOrderValue: kpiRaw.avgOrderValue || 0,
      peakHour: peakHour !== null ? `${peakHour}:00` : null,
      peakDay: peakDay || null,
    };

    return NextResponse.json({ kpis, series, categoryBreakdown, recent }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/stats:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
