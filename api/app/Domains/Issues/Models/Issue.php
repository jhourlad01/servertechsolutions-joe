<?php

namespace App\Domains\Issues\Models;

use App\Domains\IAM\Models\UserGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class Issue
 * 
 * Represents an Issue record in the system with smart AI summarization 
 * and full normalization (Priority, Category, Status, UserGroup, User).
 * 
 * @package App\Domains\Issues\Models
 */
class Issue extends Model
{
    use HasUuids, HasFactory;

    /**
     * Disable auto-incrementing as we use UUIDs as the primary key.
     * 
     * @var bool
     */
    public $incrementing = false;

    /**
     * The primary key type is a string (UUID).
     * 
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     * 
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'priority_id',
        'category_id',
        'status_id',
        'reporter_id',
        'assigned_group_id',
        'ai_summary',
        'ai_next_action',
        'is_escalated',
    ];

    /**
     * The attributes that should be cast.
     * 
     * @var array
     */
    protected $casts = [
        'is_escalated' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship: Belongs To Priority.
     */
    public function priority(): BelongsTo
    {
        return $this->belongsTo(Priority::class);
    }

    /**
     * Relationship: Belongs To Category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship: Belongs To Status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    /**
     * Relationship: Belongs To User (Reporter).
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Relationship: Belongs To UserGroup (Assignment).
     */
    public function assignedGroup(): BelongsTo
    {
        return $this->belongsTo(UserGroup::class, 'assigned_group_id');
    }
}
