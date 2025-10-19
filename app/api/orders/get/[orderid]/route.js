import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(request, { params }) {
    try {
        await connectDB()
        const getParams = await params
        const orderid = getParams.orderid

        if (!orderid) {
            return response(false, 404, 'Order not found.')
        }

        // Try to fetch by custom order_id first; if not found and param is a valid ObjectId, try by _id
        const orderDataByOrderId = await OrderModel.findOne({ order_id: orderid }).populate('products.productId', 'name slug').populate({
            path: 'products.variantId',
            populate: { path: 'media' }
        }).lean()
        let orderData = orderDataByOrderId

        // If not found by order_id, and orderid looks like an ObjectId, try findById
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderid)
        if (!orderData && isObjectId) {
            orderData = await OrderModel.findById(orderid).populate('products.productId', 'name slug').populate({
                path: 'products.variantId',
                populate: { path: 'media' }
            }).lean()
        }

        if (!orderData) {
            return response(false, 404, 'Order not found.')
        }

        return response(true, 200, 'Order found.', orderData)

    } catch (error) {
        return catchError(error)
    }
}