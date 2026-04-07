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
            $table->foreignUuid('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_group_id')->nullable()->constrained('user_groups')->onDelete('set null');

            // AI Generated Fields (Mandated Summary/Next Action)
            $table->text('ai_summary')->nullable();
            $table->text('ai_next_action')->nullable();

            // Business Logic: Escalation & SLA Rule
            $table->boolean('is_escalated')->default(false);
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('sla_due_at')->nullable();

            $table->timestamps();

            // Indices for high-volume filtering (Mandated List/Filter)
            $table->index(['status_id', 'priority_id', 'category_id']);
            $table->index('reporter_id');
            $table->index('assigned_user_id');
            $table->index(['is_escalated', 'sla_due_at']);
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
