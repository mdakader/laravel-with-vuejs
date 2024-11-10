<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'otp',
        'otp_expires_at',
        'email_verified_at',
        'phone',
        'username',
        'address',
        'photo'
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    protected $hidden = [
        'password',
        'remember_token',
        'otp'
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'password' => 'hashed',
    ];
}
