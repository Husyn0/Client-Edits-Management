<?php
namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller {
    public function index(Request $request) {
        $q = Client::withCount('edits');

        if ($search = $request->query('search')) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhereHas('companies', fn ($c) =>
                        $c->where('name', 'like', "%$search%"))
                  ->orWhereHas('companies.services', fn ($s) =>
                        $s->where('name', 'like', "%$search%"));
            });
        }

        if ($from = $request->query('last_contact_followup_from')) {
            $q->whereDate('last_contact_followup', '>=', $from);
        }

        if ($to = $request->query('last_contact_followup_to')) {
            $q->whereDate('last_contact_followup', '<=', $to);
        }

        if ($request->query('last_contact_followup') === 'empty') {
            $q->whereNull('last_contact_followup');
        }

        if ($request->query('last_contact_followup') === 'not_empty') {
            $q->whereNotNull('last_contact_followup');
        }

        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'phone'                 => 'required|string|max:50',
            'email'                 => 'required|email|unique:clients',
            'last_contact_followup' => 'nullable|date',
        ]);
        return Client::create($data);
    }

    public function show(Client $client) {
        return $client->load('companies.services', 'edits.attachments');
    }

    public function update(Request $request, Client $client) {
        $data = $request->validate([
            'name'                  => 'sometimes|required|string|max:255',
            'phone'                 => 'sometimes|required|string|max:50',
            'email'                 => 'sometimes|required|email|unique:clients,email,'.$client->id,
            'last_contact_followup' => 'nullable|date',
        ]);
        $client->update($data);
        return $client;
    }

    public function destroy(Client $client) {
        $client->delete();
        return response()->json(['message' => 'Deleted']);
    }
}