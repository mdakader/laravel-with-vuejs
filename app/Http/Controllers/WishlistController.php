<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Display a listing of the user's wishlist items.
     */
    public function index()
    {
        $wishlistItems = Wishlist::where('user_id', auth()->id())
            ->with('product')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'added_at' => $item->created_at,
                ];
            });

        return response()->json(['items' => $wishlistItems]);
    }

    /**
     * Add a product to the user's wishlist.
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $wishlist = Wishlist::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'product_id' => $request->product_id
            ]
        );

        return response()->json(['message' => 'Product added to wishlist']);
    }

    /**
     * Remove a product from the user's wishlist.
     */
    public function remove(Request $request)
    {
        Wishlist::where('user_id', auth()->id())
            ->where('product_id', $request->product_id)
            ->delete();

        return response()->json(['message' => 'Item removed from wishlist']);
    }

    /**
     * Clear all items in the user's wishlist.
     */
    public function clear()
    {
        Wishlist::where('user_id', auth()->id())->delete();

        return response()->json(['message' => 'Wishlist cleared']);
    }
}
