import { orderNotification } from "@/email/orderNotification";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().length(24, 'Invalid product id format'),
            variantId: z.string().length(24, 'Invalid variant id format'),
            name: z.string().min(1),
            qty: z.number().min(1),
            mrp: z.number().nonnegative(),
            sellingPrice: z.number().nonnegative()
        })

        const orderSchema = zSchema.pick({
            name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
        }).extend({
            userId: z.string().optional(),
            // Razorpay fields are optional for COD
            razorpay_payment_id: z.string().min(3, 'Payment id is required.').optional(),
            razorpay_order_id: z.string().min(3, 'Order id is required.').optional(),
            razorpay_signature: z.string().min(3, 'Signature is required.').optional(),
            paymentMethod: z.string().optional(),
            shippingCharge: z.number().nonnegative().optional(),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative(),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema)
        })


        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validatedData = validate.data

        // payment verification for Razorpay only
        let paymentVerification = false
        if (validatedData.paymentMethod && validatedData.paymentMethod.toUpperCase() === 'RAZORPAY') {
            const verification = validatePaymentVerification({
                order_id: validatedData.razorpay_order_id,
                payment_id: validatedData.razorpay_payment_id
            }, validatedData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

            if (verification) paymentVerification = true
        }

        // For COD, generate simple order id and set payment fields accordingly
        let orderIdToStore = validatedData.razorpay_order_id || ''
        let paymentIdToStore = validatedData.razorpay_payment_id || ''
        if (!validatedData.razorpay_order_id && validatedData.paymentMethod && validatedData.paymentMethod.toUpperCase() === 'COD') {
            // create a simple unique order id: prefix + timestamp
            orderIdToStore = `COD_${Date.now()}`
            paymentIdToStore = `COD_${Date.now()}`
        }

        const newOrder = await OrderModel.create({
            user: validatedData.userId,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            country: validatedData.country,
            state: validatedData.state,
            city: validatedData.city,
            pincode: validatedData.pincode,
            landmark: validatedData.landmark,
            ordernote: validatedData.ordernote,
            products: validatedData.products,
            discount: validatedData.discount,
            couponDiscountAmount: validatedData.couponDiscountAmount,
            totalAmount: validatedData.totalAmount,
            subtotal: validatedData.subtotal,
            payment_id: paymentIdToStore,
            order_id: orderIdToStore,
            status: (validatedData.paymentMethod && validatedData.paymentMethod.toUpperCase() === 'COD') ? 'pending' : (paymentVerification ? 'pending' : 'unverified'),
            shippingCharge: validatedData.shippingCharge || 0
        })

        try {
            const mailData = {
                order_id: orderIdToStore,
                orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${orderIdToStore}`
            }

            await sendMail('Order placed successfully.', validatedData.email, orderNotification(mailData))

        } catch (error) {
            console.log(error)
        }


    // Return the saved order's MongoDB _id for consistent routing
    return response(true, 200, 'Order placed successfully.', newOrder._id)

    } catch (error) {
        return catchError(error)
    }

}