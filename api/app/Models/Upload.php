<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Upload extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'user_id',
        'original_filename',
        'file_path',
        'mime_type',
        'size',
    ];

    protected $appends = ['download_url'];

    public function getDownloadUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'uploads.download',
            now()->addMinutes(60),
            ['upload' => $this->id]
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
