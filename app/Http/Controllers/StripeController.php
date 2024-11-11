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
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        $cartItems = Cart::where('user_id', auth()->id())->with('product')->get();
        $totalAmount = 0;

        foreach ($cartItems as $item) {
            $totalAmount += $item->quantity * $item->product->price * 100; // Amount in cents
        }

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $totalAmount,  // Total amount in cents
                'currency' => 'usd',
                'metadata' => [
                    'integration_check' => 'accept_a_payment',
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Payment creation failed'], 500);
        }
    }

    public function handlePaymentSuccess(Request $request)
    {
        try {
            DB::beginTransaction();

            // Clear cart for authenticated users
            $cartItems = Cart::where('user_id', auth()->id())->get();
            Cart::where('user_id', auth()->id())->delete();

            // Clear cart for guest users
            $guestCart = json_decode($request->cookie('guest_cart'), true);
            if ($guestCart) {
                setcookie('guest_cart', '', time() - 3600, '/');
            }

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'total_amount' => $cartItems->sum(function ($item) {
                    return $item->quantity * $item->product->price;
                }),
                'status' => 'pending',
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

            DB::commit();

            // Return the order ID
            return response()->json([
                'message' => 'Payment successful',
                'order_id' => $order->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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
