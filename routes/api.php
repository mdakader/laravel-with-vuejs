<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes for shop
Route::get('/shop', [ProductController::class, 'index']);
Route::get('/shop/categories', [ProductController::class, 'getCategories']);
Route::get('/shop/product/{product:slug}', [ProductController::class, 'show']);

// Guest cart routes (use localStorage on frontend)
//Route::get('/cart', [CartController::class, 'index']);
//Route::post('/cart/add', [CartController::class, 'add']);
//Route::post('/cart/remove', [CartController::class, 'remove']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile-update', [AuthController::class, 'profileUpdate']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/update-email', [AuthController::class, 'updateEmail']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-otp', [AuthController::class, 'resendOTP']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Routes  Category
    Route::apiResource('categories', CategoryController::class);

    // Routes  Post
    Route::apiResource('posts', PostController::class);

    //  Route::get('/products', [ProductController::class, 'index']);
    Route::get('/get-categories', [ProductController::class, 'getCategories']);

    // Get categories for select option
    Route::get('categories/select', [ProductController::class, 'getCategories']);

    // Product routes
    Route::apiResource('products', ProductController::class);

    // Cart routes
    Route::post('/cart/transfer', [CartController::class, 'transfer']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::delete('/cart/remove/{product_id}', [CartController::class, 'remove']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);
    Route::put('/cart/update-quantity', [CartController::class, 'updateQuantity']);

});

