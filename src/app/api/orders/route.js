
import dbConnect from '@/lib/dbConnnect.js';
import Order from '@/models/schema.js';
import Pusher from 'pusher'
export const runtime = "nodejs";


const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});
export async function POST(req) {
  try {
    await dbConnect();
    const { table_num, items, total } = await req.json();

    if (!table_num || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Invalid Payload" }, { status: 400 });
    }

    const tableNo = (table_num);
    const exists=await Order.find({table_no:tableNo})
    console.log(exists)
    if(exists.length>0){
        return Response.json({error:"Order Already Exists"},{status:409})
    }
    const raw = await Order.findOneAndUpdate(
      { table_no: tableNo},
      {
        $setOnInsert: {
          table_no: tableNo,
          item: items,
          total,
          status: "pending",
        },
      },
      {
        new: true,           
        upsert: true,        
        
      }
    );
   
    const orderDoc={
      _id: raw._id.toString(),
      table_no: raw.table_no,
      item: raw.item,
      total: raw.total,
      status: raw.status,
      createdAt: raw.createdAt?.toISOString() ?? new Date().toISOString(),
    }

    await pusher.trigger('food-orders','Order-Created',orderDoc)
    
    return Response.json(
      { message: "Order created"},
      { status: 201 }
    );

  } catch (err) {
    
    if (err?.code === 11000) {
      return Response.json(
        { error: "Order already exists for this table" },
        { status: 409 }
      );
    }
    console.error("Error in posting order", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect()
    const orders = await Order.find().sort({ createdAt: -1 })

   

    return Response.json(orders)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
