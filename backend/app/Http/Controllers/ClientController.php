<?php
namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller {
    public function index(Request $request) {
        $q = Client::withCount('edits');
        if ($search = $request->query('search')) {
            $q->where(function ($w) use ($search) {
                $w->where('name','like',"%$search%")
                  ->orWhere('company_name','like',"%$search%")
                  ->orWhere('email','like',"%$search%");
            });
        }
        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|unique:clients',
            'company_name' => 'required|string|max:255',
            'service' => 'required|string|max:255',
            'last_contact_followup' => 'nullable|date',
        ]);
        return Client::create($data);
    }

    public function show(Client $client) {
        return $client->load('edits.attachments');
    }

    public function update(Request $request, Client $client) {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:50',
            'email' => 'sometimes|required|email|unique:clients,email,'.$client->id,
            'company_name' => 'sometimes|required|string|max:255',
            'service' => 'sometimes|required|string|max:255',
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