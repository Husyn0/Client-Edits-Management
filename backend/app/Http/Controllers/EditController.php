<?php
namespace App\Http\Controllers;

use App\Models\Edit;
use Illuminate\Http\Request;

class EditController extends Controller {
    public function index(Request $request) {
        $q = Edit::with('client')->withCount('attachments');
        if ($status = $request->query('status')) $q->where('status', $status);
        if ($priority = $request->query('priority')) $q->where('priority', $priority);
        if ($clientId = $request->query('client_id')) $q->where('client_id', $clientId);
        if ($search = $request->query('search')) {
            $q->where('title','like',"%$search%");
        }
        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:High,Medium,Low',
            'payment' => 'nullable|numeric|min:0',
            'is_paid' => 'boolean',
            'status' => 'required|in:pending,approved,in_progress,done,cancelled',
        ]);
        return Edit::create($data)->load('client');
    }

    public function show(Edit $edit) {
        return $edit->load(['client','attachments']);
    }

    public function update(Request $request, Edit $edit) {
        $data = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|in:High,Medium,Low',
            'payment' => 'nullable|numeric|min:0',
            'is_paid' => 'boolean',
            'status' => 'sometimes|in:pending,approved,in_progress,done,cancelled',
        ]);
        $edit->update($data);
        return $edit->load('client');
    }

    public function destroy(Edit $edit) {
        $edit->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function stats() {
        return [
            'total_clients' => \App\Models\Client::count(),
            'total_edits' => Edit::count(),
            'pending' => Edit::where('status','pending')->count(),
            'in_progress' => Edit::where('status','in_progress')->count(),
            'done' => Edit::where('status','done')->count(),
            'unpaid_total' => (float) Edit::where('is_paid', false)->sum('payment'),
            'paid_total' => (float) Edit::where('is_paid', true)->sum('payment'),
        ];
    }
}