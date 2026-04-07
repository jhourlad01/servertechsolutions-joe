<?php

namespace App\Domains\Issues\Models;

use App\Domains\IAM\Models\UserGroup;
use App\Models\User;
use Database\Factories\IssueFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Issue extends Model
{
    use HasFactory, HasUuids;

    protected static function newFactory()
    {
        return IssueFactory::new();
    }

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'priority_id',
        'status_id',
        'reporter_id',
        'assigned_user_id',
        'assigned_group_id',
        'is_escalated',
        'escalated_at',
        'sla_due_at',
        'ai_summary',
        'ai_next_action',
    ];

    protected function casts(): array
    {
        return [
            'is_escalated' => 'boolean',
            'escalated_at' => 'datetime',
            'sla_due_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(Priority::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function assignedGroup(): BelongsTo
    {
        return $this->belongsTo(UserGroup::class, 'assigned_group_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(IssueMessage::class);
    }
}
