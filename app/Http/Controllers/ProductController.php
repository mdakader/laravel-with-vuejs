<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of products with optional filters
     */
//    public function index(Request $request)
//    {
//        $query = Product::with(['category', 'user']);
//
//        // Filter by category
//        if ($request->has('category_id')) {
//            $query->where('category_id', $request->category_id);
//        }
//
//        // Filter by active status
//        if ($request->has('is_active')) {
//            $query->where('is_active', $request->is_active);
//        }
//
//        // Search by name
//        if ($request->has('search')) {
//            $query->where('name', 'like', '%' . $request->search . '%');
//        }
//
//        // Sort products
//        $sortField = $request->get('sort_by', 'created_at');
//        $sortDirection = $request->get('sort_direction', 'desc');
//        $query->orderBy($sortField, $sortDirection);
//
//        $products = $query->paginate($request->get('per_page', 10));
//
//        return response()->json([
//            'status' => 'success',
//            'data' => $products,
//        ]);
//    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'user']);

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate($request->get('per_page', 2));

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Get categories for select option
     */
    public function getCategories()
    {
        $categories = Category::select('id', 'name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean' // Make sure this accepts true/false values
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $validated['user_id'] = auth()->id();
        $validated['slug'] = Str::slug($validated['name']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product->load('category', 'user')
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        return response()->json([
            'status' => 'success',
            'data' => $product->load('category', 'user')
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['category', 'user'])
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        // Delete product image if exists
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully'
        ]);
    }
}
