<?php
namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{

    public function index()
    {
        $categories = Category::all();
        return response()->json( $categories );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $category = new Category($request->only(['name', 'description']));
        $category->user_id = auth()->id();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $category->image = $path;
        }

        $category->save();

        return response()->json($category, 201);
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json( $category );
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Category not found'], 404);
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'sometimes|required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $category->fill($request->only(['name', 'description']));

            if ($request->hasFile('image')) {
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $path = $request->file('image')->store('categories', 'public');
                $category->image = $path;
            }

            $category->save();

            return response()->json($category);

        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validation failed',
            ], 422);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);

            // Delete the associated image if it exists
            if ($category->image) {
                try {
                    if (Storage::disk('public')->exists($category->image)) {
                        Storage::disk('public')->delete($category->image);
                    }
                } catch (\Exception $e) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Error deleting image',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            $category->delete();

            return response()->json([
                'status' => true,
                'category' => $category,
                'message' => 'Category deleted successfully',
                'image_deleted' => $category->image ? true : false
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Category not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting post',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

