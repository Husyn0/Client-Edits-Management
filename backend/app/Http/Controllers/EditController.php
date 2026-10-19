<?php
namespace App\Http\Controllers;

use App\Models\Edit;
use Illuminate\Http\Request;

class EditController extends Controller {
    public function index(Request $request) {
        $q = Edit::with('client', 'service.company')->withCount('attachments');
        if ($status    = $request->query('status'))     $q->where('status', $status);
        if ($priority  = $request->query('priority'))   $q->where('priority', $priority);
        if ($clientId  = $request->query('client_id'))  $q->where('client_id', $clientId);
        if ($serviceId = $request->query('service_id')) $q->where('service_id', $serviceId);
        if ($search    = $request->query('search')) {
            $q->where('title', 'like', "%$search%");
        }
        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'client_id'   => 'required|exists:clients,id',
            'service_id'  => 'required|exists:services,id',
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'required|in:High,Medium,Low',
            'payment'     => 'nullable|numeric|min:0',
            'is_paid'     => 'boolean',
            'status'      => 'required|in:pending,approved,in_progress,done,cancelled',
        ]);
        return Edit::create($data)->load('client', 'service');
    }

    public function show(Edit $edit) {
        return $edit->load(['client', 'service.company', 'attachments']);
    }

    public function update(Request $request, Edit $edit) {
        $data = $request->validate([
            'client_id'   => 'sometimes|exists:clients,id',
            'service_id'  => 'sometimes|exists:services,id',
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'sometimes|in:High,Medium,Low',
            'payment'     => 'nullable|numeric|min:0',
            'is_paid'     => 'boolean',
            'status'      => 'sometimes|in:pending,approved,in_progress,done,cancelled',
        ]);
        $edit->update($data);
        return $edit->load('client', 'service');
    }

    public function destroy(Edit $edit) {
        $edit->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function stats() {
        return [
            'total_clients'   => \App\Models\Client::count(),
            'total_companies' => \App\Models\Company::count(),
            'total_services'  => \App\Models\Service::count(),
            'total_edits'     => Edit::count(),
            'pending'         => Edit::where('status','pending')->count(),
            'in_progress'     => Edit::where('status','in_progress')->count(),
            'done'            => Edit::where('status','done')->count(),
            'unpaid_total'    => (float) Edit::where('is_paid', false)->sum('payment'),
            'paid_total'      => (float) Edit::where('is_paid', true)->sum('payment'),
        ];
    }
}