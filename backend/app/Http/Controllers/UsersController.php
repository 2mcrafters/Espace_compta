<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\User;
use App\Models\UserRate;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function store(Request $request)
    {
        // ADMIN can create via Gate::before; others need users.edit
        Gate::authorize('users.edit');

        $data = $request->validate([
            'first_name' => ['nullable','string','max:255'],
            'last_name' => ['nullable','string','max:255'],
            'name' => ['nullable','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'phone' => ['nullable','string','max:30'],
            'internal_id' => ['nullable','string','max:255','unique:users,internal_id'],
            'job_title' => ['nullable','string','max:255'],
            'monthly_hours_target' => ['nullable','numeric'],
            'yearly_hours_target' => ['nullable','numeric'],
            'password' => ['required', PasswordRule::defaults()],
            'roles' => ['array'],
            'roles.*' => ['string','exists:roles,name'],
            'hourly_rate_mad' => ['nullable','numeric','min:0'],
            'hourly_rate_effective_from' => ['nullable','date'],
        ]);

        // Derive display name if not provided
        if (empty($data['name'])) {
            $parts = trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''));
            $data['name'] = $parts !== '' ? $parts : explode('@', $data['email'])[0];
        }

        $user = User::create([
            'name' => $data['name'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'internal_id' => $data['internal_id'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'monthly_hours_target' => $data['monthly_hours_target'] ?? null,
            'yearly_hours_target' => $data['yearly_hours_target'] ?? null,
            'password' => $data['password'],
        ]);

        // Assign roles if provided
        if (!empty($data['roles']) && method_exists($user, 'syncRoles')) {
            $user->syncRoles($data['roles']);
        }

        // Optionally set initial hourly rate
        if (isset($data['hourly_rate_mad'])) {
            $effectiveFrom = $data['hourly_rate_effective_from'] ?? now()->toDateString();
            $effectiveFrom = Carbon::parse($effectiveFrom)->toDateString();
            UserRate::updateOrCreate(
                ['user_id' => $user->id, 'effective_from' => $effectiveFrom],
                ['hourly_rate_mad' => $data['hourly_rate_mad']]
            );
        }

        return response()->json($this->transform($user->fresh()), 201);
    }
    public function index()
    {
        // Avoid eager-loading roles when Spatie HasRoles isn't available
        $query = User::query();
        if (method_exists(User::class, 'roles')) {
            $query->with('roles');
        }
        $users = $query->orderBy('name')->get();
        return response()->json($users->map(fn($u) => $this->transform($u)));
    }

    public function show(User $user)
    {
        return response()->json($this->transform($user));
    }

    public function update(Request $request, User $user)
    {
        // Authorize via policy if present, otherwise allow self-edit
        $actor = $request->user();
        $policy = Gate::getPolicyFor(User::class);
        if ($policy) {
            $this->authorize('update', $user);
        } else {
            $isSelf = $actor && $actor->id === $user->id;
            abort_unless($isSelf, 403);
        }
        $data = $request->validate([
            'first_name' => ['nullable','string','max:255'],
            'last_name' => ['nullable','string','max:255'],
            'phone' => ['nullable','string','max:30'],
            'internal_id' => ['nullable','string','max:255','unique:users,internal_id,'.$user->id],
            'job_title' => ['nullable','string','max:255'],
            'monthly_hours_target' => ['nullable','numeric'],
            'yearly_hours_target' => ['nullable','numeric'],
        ]);
        $user->update($data);
        return response()->json($this->transform($user));
    }

    public function setRate(Request $request, User $user)
    {
        // Allow via Gate (ADMIN will pass via Gate::before).
        abort_unless(Gate::allows('users.rate.set'), 403);
        $data = $request->validate([
            'hourly_rate_mad' => ['required','numeric','min:0'],
            'effective_from' => ['required','date'],
        ]);
        // Normalize date to Y-m-d to satisfy cast
        $effectiveFrom = Carbon::parse($data['effective_from'])->toDateString();
        $rate = UserRate::updateOrCreate(
            ['user_id' => $user->id, 'effective_from' => $effectiveFrom],
            ['hourly_rate_mad' => $data['hourly_rate_mad']]
        );
        return response()->json($rate, 201);
    }

    public function stats(User $user)
    {
        $today = Carbon::today();
        $startMonth = $today->copy()->startOfMonth();
        $startYear = $today->copy()->startOfYear();

        $monthMin = TimeEntry::where('user_id',$user->id)
            ->where('start_at','>=',$startMonth)
            ->sum('duration_min');
        $yearMin = TimeEntry::where('user_id',$user->id)
            ->where('start_at','>=',$startYear)
            ->sum('duration_min');

        return response()->json([
            'minutes_month' => (int)$monthMin,
            'minutes_year' => (int)$yearMin,
        ]);
    }

    private function transform(User $user): array
    {
        $actor = Auth::user();
        $canViewRate = Gate::allows('users.rate.set') || Gate::allows('viewReports');
        $latestRate = null;
        if ($canViewRate) {
            $latestRate = UserRate::where('user_id', $user->id)->orderByDesc('effective_from')->first();
        }
        return [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'internal_id' => $user->internal_id,
            'job_title' => $user->job_title,
            'monthly_hours_target' => $user->monthly_hours_target,
            'yearly_hours_target' => $user->yearly_hours_target,
            'roles' => method_exists($user,'getRoleNames') ? (array) $user->getRoleNames()->toArray() : [],
            'hourly_rate_mad' => $canViewRate && $latestRate ? $latestRate->hourly_rate_mad : null,
            'hourly_rate_effective_from' => $canViewRate && $latestRate ? optional($latestRate->effective_from)->toDateString() : null,
        ];
    }
}
