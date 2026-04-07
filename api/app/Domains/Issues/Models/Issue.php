<?php

namespace App\Domains\Issues\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Issue extends Model
{
    use HasFactory, HasUuids;

    protected static function newFactory()
    {
        return \Database\Factories\IssueFactory::new();
    }

    protected $fillable = [
        'title', 
        'identification_number', 
        'category_id', 
        'priority_id', 
        'status_id', 
        'assigned_agent_id'
    ];

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function priority(): BelongsTo { return $this->belongsTo(Priority::class); }
    public function status(): BelongsTo { return $this->belongsTo(Status::class); }
    public function assignedAgent(): BelongsTo { return $this->belongsTo(User::class, 'assigned_agent_id'); }
}
