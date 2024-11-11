<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Cart;
use DB;

class StripeController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

            // Check if cart is empty
            $cartItems = Cart::where('user_id', auth()->id())->with('product')->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['message' => 'Cart is empty'], 400);
            }

            $totalAmount = 0;

            foreach ($cartItems as $item) {
                if (!$item->product) {
                    \Log::error('Product not found for cart item: ' . $item->id);
                    continue;
                }
                $totalAmount += $item->quantity * $item->product->price * 100;
            }

            if ($totalAmount <= 0) {
                return response()->json(['message' => 'Invalid total amount'], 400);
            }

            $paymentIntent = PaymentIntent::create([
                'amount' => (int)$totalAmount,  // Ensure integer value
                'currency' => 'usd',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Intent Creation Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Payment creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handlePaymentSuccess(Request $request)
    {
        try {
            DB::beginTransaction();

            // Clear cart for authenticated users
            $cartItems = Cart::where('user_id', auth()->id())->get();

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'total_amount' => $cartItems->sum(function ($item) {
                    return $item->quantity * $item->product->price;
                }),
                'status' => 'completed',
                'payment_intent' => $request->input('payment_intent')
            ]);

            // Create order items
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);
            }

            // Clear the cart
            Cart::where('user_id', auth()->id())->delete();

            DB::commit();

            return response()->json([
                'message' => 'Payment successful',
                'order_id' => $order->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payment success handling error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing payment'], 500);
        }
    }


    public function getOrderConfirmation($orderId)
    {
        try {
            $order = Order::with('items.product')->findOrFail($orderId);

            $orderDetails = [
                'order' => [  // Wrap in 'order' key to match frontend expectations
                    'id' => $order->id,
                    'total' => $order->total_amount,
                    'date' => $order->created_at->format('Y-m-d'),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                        ];
                    }),
                ]
            ];

            return response()->json($orderDetails);
        } catch (\Exception $e) {
            \Log::error('Error fetching order details: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching order details'], 500);
        }
    }

    public function getOrderDetails($orderId)
    {
        try {
            $order = Order::with('items.product')->findOrFail($orderId);

            $orderDetails = [
                'id' => $order->id,
                'total' => $order->total_amount,
                'date' => $order->created_at->format('Y-m-d'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
            ];

            return response()->json($orderDetails);
        } catch (\Exception $e) {
            \Log::error('Error fetching order details: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching order details'], 500);
        }
    }

}
