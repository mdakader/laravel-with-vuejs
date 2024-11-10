<?php

namespace App\Http\Controllers;

use App\Models\Cart;
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
                        'quantity' => $item->quantity
                    ];
                });
        } else {
            $cartItems = [];
        }

        return response()->json(['items' => $cartItems]);
    }

    public function add(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            // Check product stock
            $product = Product::findOrFail($request->product_id);
            if ($product->stock < $request->quantity) {
                return response()->json([
                    'message' => 'Not enough stock available'
                ], 422);
            }

            if (auth()->check()) {
                $cartItem = Cart::where('user_id', auth()->id())
                    ->where('product_id', $request->product_id)
                    ->first();

                if ($cartItem) {
                    $cartItem->quantity += $request->quantity;
                    $cartItem->save();
                } else {
                    Cart::create([
                        'user_id' => auth()->id(),
                        'product_id' => $request->product_id,
                        'quantity' => $request->quantity
                    ]);
                }

                DB::commit();
                return response()->json([
                    'message' => 'Product added to cart',
                    'product' => $product // Send product data back
                ]);
            } else {
                // For guest users, just return success with product data
                return response()->json([
                    'message' => 'Product added to cart',
                    'product' => $product
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
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

            // Process checkout logic here
            // For example: create order, update stock, etc.

            // Clear cart after successful checkout
            Cart::where('user_id', auth()->id())->delete();

            DB::commit();
            return response()->json(['message' => 'Checkout successful']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error during checkout'], 500);
        }
    }
}
