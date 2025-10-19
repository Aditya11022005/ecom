import { connectDB } from '@/lib/databaseConnection';
import { catchError, response } from '@/lib/helperFunction';
import OrderModel from '@/models/Order.model';

export async function PUT(request) {
    try {
        await connectDB();
        const payload = await request.json();
        const { orderId, paymentId } = payload;

        if (!orderId) {
            return response(false, 400, 'orderId is required.')
        }

        // try find by order_id or _id
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId)
        let order = await OrderModel.findOne({ order_id: orderId })
        if (!order && isObjectId) {
            order = await OrderModel.findById(orderId)
        }

        if (!order) {
            return response(false, 404, 'Order not found.')
        }

        // set payment id (allow passing a custom paymentId, otherwise generate one)
        const newPaymentId = paymentId || `COD_PAID_${Date.now()}`
        order.payment_id = newPaymentId
        // update status to processing (or keep as pending) - set to processing to indicate paid and being handled
        order.status = 'processing'

        await order.save()

        return response(true, 200, 'Order marked as paid.', order._id)

    } catch (error) {
        return catchError(error)
    }
}
