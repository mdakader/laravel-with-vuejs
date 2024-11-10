<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id(); // Primary key for the cart item
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Links to users table
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // Links to products table
            $table->integer('quantity')->default(1); // Quantity of the product in the cart
            $table->timestamps();

            $table->unique(['user_id', 'product_id']); // Ensure one unique cart entry per product for each user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
