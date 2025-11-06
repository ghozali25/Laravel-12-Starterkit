<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            // In testing, do not require recaptcha to allow feature tests to pass
            'g-recaptcha-response' => app()->environment('testing') ? ['nullable', 'string'] : ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (!app()->environment('testing')) {
            $this->verifyRecaptcha();
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    /**
     * Verify Google reCAPTCHA v2 response with Google API.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function verifyRecaptcha(): void
    {
        $secret = Config::get('services.recaptcha.secret_key');
        $response = $this->input('g-recaptcha-response');

        if (! $secret || ! $response) {
            throw ValidationException::withMessages([
                'g-recaptcha-response' => __('The reCAPTCHA verification failed.'),
            ]);
        }

        $pending = Http::asForm();
        if (app()->environment('local')) {
            $pending = $pending->withoutVerifying();
        }

        $verify = $pending->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $response,
            'remoteip' => $this->ip(),
        ]);

        if (! $verify->ok() || ! (bool) data_get($verify->json(), 'success')) {
            throw ValidationException::withMessages([
                'g-recaptcha-response' => __('The reCAPTCHA verification failed.'),
            ]);
        }
    }
}

