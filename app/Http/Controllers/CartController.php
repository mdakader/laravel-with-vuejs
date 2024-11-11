<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{

    public function index(Request $request)
    {
        if (auth()->check()) {
            $cartItems = Cart::where('user_id', auth()->id())
                ->with('product')
                ->get()
                ->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                        'image' => $item->product->image // Add image
                    ];
                });
        } else {
            $cartItems = [];
        }

        return response()->json(['items' => $cartItems]);
    }

// CartController.php

    public function add(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($request->product_id);
            if ($product->stock < $request->quantity) {
                return response()->json([
                    'message' => 'Not enough stock available'
                ], 422);
            }

            if (auth()->check()) {
                // Check if item already exists in cart
                $cartItem = Cart::where('user_id', auth()->id())
                    ->where('product_id', $request->product_id)
                    ->first();

                if ($cartItem) {
                    // Update existing cart item
                    $cartItem->quantity += $request->quantity;
                    $cartItem->save();
                } else {
                    // Create new cart item
                    Cart::create([
                        'user_id' => auth()->id(),
                        'product_id' => $request->product_id,
                        'quantity' => $request->quantity
                    ]);
                }

                DB::commit();

                // Return updated cart items
                return $this->index($request); // Reuse index method to return cart items
            }

            return response()->json([
                'message' => 'Product added to cart',
                'items' => []
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Cart add error: ' . $e->getMessage());
            return response()->json(['message' => 'Error adding product to cart'], 500);
        }
    }

    public function updateQuantity(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            if (auth()->check()) {
                $cartItem = Cart::where('user_id', auth()->id())
                    ->where('product_id', $request->product_id)
                    ->firstOrFail();

                // Check product stock
                $product = Product::findOrFail($request->product_id);
                if ($product->stock < $request->quantity) {
                    return response()->json([
                        'message' => 'Not enough stock available'
                    ], 422);
                }

                $cartItem->quantity = $request->quantity;
                $cartItem->save();
            }

            return response()->json(['message' => 'Quantity updated']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating quantity'], 500);
        }
    }

    public function remove(Request $request)
    {
        try {
            if (auth()->check()) {
                Cart::where('user_id', auth()->id())
                    ->where('product_id', $request->product_id)
                    ->delete();
            }

            return response()->json(['message' => 'Item removed from cart']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error removing item'], 500);
        }
    }

    public function checkout(Request $request)
    {
        try {
            DB::beginTransaction();

            $cartItems = Cart::where('user_id', auth()->id())
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['message' => 'Cart is empty'], 422);
            }

            // Validate stock availability
            foreach ($cartItems as $item) {
                if ($item->product->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock for {$item->product->name}"
                    ], 422);
                }
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

                // Update product stock
                $item->product->decrement('stock', $item->quantity);
            }

            // Clear cart after successful checkout
            Cart::where('user_id', auth()->id())->delete();

            DB::commit();

            return response()->json([
                'message' => 'Checkout successful',
                'order_id' => $order->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error during checkout'], 500);
        }
    }

}
