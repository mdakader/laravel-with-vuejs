<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function generateOTP()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function register(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'email_verified_at' => null,
            ]);

            // Generate and save OTP
            $otp = $this->generateOTP();
            $user->update([
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10)
            ]);

            // Send verification email
            try {
                Mail::to($user->email)->send(new EmailVerificationMail($user->name, $otp));
            } catch (\Exception $e) {
                Log::error('Failed to send OTP: ' . $e->getMessage());
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Registration successful. Please check your email for OTP.'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $validatedData['email'])->first();

            if (!$user || !Hash::check($validatedData['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Login successful'
            ]);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6'
        ]);

        $user = $request->user();  // Assumes the user is authenticated

        if ($user->otp !== $request->otp) {
            return response()->json([
                'message' => 'Invalid OTP'
            ], 400);
        }

        if ($user->otp_expires_at < now()) {
            return response()->json([
                'message' => 'OTP has expired'
            ], 400);
        }

        // Update user as verified
        $user->update([
            'email_verified_at' => now(),
            'otp' => null,
            'otp_expires_at' => null
        ]);

        return response()->json([
            'message' => 'Email verified successfully',
            'user' => $user
        ]);
    }


    public function resendOTP(Request $request)
    {
        try {
            $user = $request->user();
            $otp = $this->generateOTP();
            $user->update([
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10)
            ]);

            Mail::to($user->email)->send(new EmailVerificationMail($user->name, $otp));

            return response()->json([
                'message' => 'OTP resent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('OTP resend error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to resend OTP'
            ], 500);
        }
    }


    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Logout failed'
            ], 500);
        }
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }


    public function profileUpdate(Request $request)
    {
        try {
            // Log the incoming request data
            \Log::info('Profile update request received', $request->all());

            // Validation
            $validatedData = $request->validate([
                'name' => 'required|string|min:2|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
                'username' => 'nullable|string|max:255|unique:users,username,' . $request->user()->id,
                'phone' => 'nullable|string|max:20|unique:users,phone,' . $request->user()->id,
                'address' => 'nullable|string|max:500',
                'photo' => 'nullable|image|max:2048'
            ]);

            // Get the current user
            $user = $request->user();

            // Handle photo upload if present
            if ($request->hasFile('photo')) {
                if ($user->photo) {
                    Storage::delete('public/' . $user->photo);
                }
                $path = $request->file('photo')->store('profile-photos', 'public');
                $validatedData['photo'] = $path;
            }

            // Update user
            $user->update($validatedData);

            // Return response
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Profile update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
