<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->date('due_date')->nullable();
            $table->enum('priority', ['High', 'Medium', 'Low'])->default('Medium');
            $table->decimal('payment', 10, 2)->nullable();
            $table->boolean('is_paid')->default(false);
            $table->enum('status', ['pending', 'approved', 'in_progress', 'done', 'cancelled'])
                  ->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('edits'); }
};