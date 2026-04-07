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
        Schema::create('issues', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Human-friendly reference
            $table->bigInteger('line_number')->unique()->unsigned()->autoIncrement();

            $table->string('title');
            $table->text('description');

            // Normalized Lookup FKs
            $table->foreignId('priority_id')->constrained('priorities')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('statuses')->onDelete('cascade');

            // Identity FKs
            $table->foreignUuid('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_group_id')->nullable()->constrained('user_groups')->onDelete('set null');

            // AI Generated Fields
            $table->text('ai_summary')->nullable();
            $table->text('ai_next_action')->nullable();

            $table->boolean('is_escalated')->default(false);

            $table->timestamps();

            // Indices for high-volume filtering
            $table->index(['status_id', 'priority_id', 'category_id']);
            $table->index('reporter_id');
            $table->index('assigned_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
