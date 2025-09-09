import { Schema } from "mongoose";
import mongoose  from "mongoose";

const orderItemSchema=new Schema({
    category:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    qty:{
        type:Number,
        required:true
    },
},{_id:false})

const orderSchema=new Schema({
    table_no:{
        type:Number,
        required:true
    },
    item:{
        type:[orderItemSchema],
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["pending","completed"]
    }
},{timestamps:true})

orderSchema.index({status:1,createdAt:-1});
orderSchema.index({table_no:1},{unique:true});

export default mongoose.models.Order || mongoose.model("Order",orderSchema);