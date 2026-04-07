<?php

namespace App\Http\Controllers;

use App\Domains\Issues\Models\Issue;
use App\Models\Upload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IssueMessageController extends Controller
{
    public function index(Issue $issue)
    {
        return response()->json([
            'data' => $issue->messages()->with(['user', 'upload'])->oldest()->get(),
        ]);
    }

    public function store(Request $request, Issue $issue)
    {
        $request->validate([
            'content' => 'required_without:attachment|string|nullable',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $uploadId = null;
        $type = 'text';

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $uploadId = (string) Str::uuid();
            $userId = $request->user()->id;

            $path = $file->storeAs(
                "uploads/{$userId}/{$uploadId}",
                $file->getClientOriginalName(),
                'public'
            );

            Upload::create([
                'id' => $uploadId,
                'user_id' => $userId,
                'original_filename' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            $type = 'file';
            $content = $request->filled('content') ? $request->input('content') : $file->getClientOriginalName();
        } else {
            $content = $request->input('content');
        }

        $message = $issue->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $content,
            'upload_id' => $uploadId,
            'type' => $type,
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'data' => $message->load(['user', 'upload']),
        ], 201);
    }

    public function download(Upload $upload)
    {
        if (! Storage::disk('public')->exists($upload->file_path)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::disk('public')->download(
            $upload->file_path,
            $upload->original_filename
        );
    }
}
