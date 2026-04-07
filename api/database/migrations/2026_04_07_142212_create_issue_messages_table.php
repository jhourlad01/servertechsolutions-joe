<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('issue_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('issue_id')->constrained('issues')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users');
            $table->text('content');
            $table->string('upload_id')->nullable();
            $table->string('type')->default('text'); // 'text' or 'file'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_messages');
    }
};
