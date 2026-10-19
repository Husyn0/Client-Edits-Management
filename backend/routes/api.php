<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EditController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/stats', [EditController::class, 'stats']);

    Route::apiResource('clients', ClientController::class);

    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('services',  ServiceController::class);

    Route::apiResource('edits', EditController::class);
    Route::get('/attachments', [AttachmentController::class, 'index']);
    Route::post('/edits/{edit}/attachments', [AttachmentController::class, 'store']);
    Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
});