<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::all();
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255|unique:posts,title',
                'description' => 'required|string', // Removed 'nullable' since it conflicts with 'required'
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $post = new Post($request->only(['title', 'description']));

            if ($request->hasFile('image')) {
                // Get original file extension
                $extension = $request->file('image')->getClientOriginalExtension();

                // Generate a unique filename with extension
                $filename = uniqid() . '_' . time() . '.' . $extension;

                // Store with custom filename
                $path = $request->file('image')->storeAs('posts', $filename, 'public');

                // Save the path to database
                $post->image = $path;

                // Debug log
                \Log::info('Image stored at: ' . $path);
            }

            $post->save();

            // Return the complete post data including the full image URL
            return response()->json([
                'post' => $post,
                'image_url' => $post->image ? asset('storage/' . $post->image) : null
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validation failed',
            ], 422);
        } catch (\Exception $e) {
            // Add general exception handling
            \Log::error('Post creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $post = Post::findOrFail($id);
            return response()->json($post);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Post not found'], 404);
        }
    }

    public function update(Request $request, Post $post)
    {
        try {
            $request->validate([
                'title' => 'sometimes|required|string|max:255|unique:posts,title,' . $post->id,
                'description' => 'sometimes|required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $post->fill($request->only(['title', 'description']));

            if ($request->hasFile('image')) {
                if ($post->image) {
                    Storage::disk('public')->delete($post->image);
                }
                $path = $request->file('image')->store('posts', 'public');
                $post->image = $path;
            }

            $post->save();

            return response()->json($post);

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
            $post = Post::findOrFail($id);

            // Delete the associated image if it exists
            if ($post->image) {
                try {
                    if (Storage::disk('public')->exists($post->image)) {
                        Storage::disk('public')->delete($post->image);
                    }
                } catch (\Exception $e) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Error deleting image',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            $post->delete();

            return response()->json([
                'status' => true,
                'post' => $post,
                'message' => 'Post deleted successfully',
                'image_deleted' => $post->image ? true : false
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Post not found'
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
