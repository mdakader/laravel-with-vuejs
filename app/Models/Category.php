<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'image', 'description', 'user_id'];

    // Define relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Define relationship with Post
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // Define relationship with Product
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
