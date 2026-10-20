<?php
namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller {
    public function index(Request $request) {
        $q = Company::with('client')->withCount('services');

        if ($clientId = $request->query('client_id')) {
            $q->where('client_id', $clientId);
        }
        if ($search = $request->query('search')) {
            $q->where('name', 'like', "%$search%");
        }
        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name'      => [
                'required', 'string', 'max:255',
                Rule::unique('companies', 'name')
                    ->where(fn ($q) => $q->where('client_id', $request->input('client_id'))),
            ],
            'phone'     => 'nullable|string|max:50',
            'email'     => 'nullable|email',
            'address'   => 'nullable|string|max:255',
        ]);

        return Company::create($data)->load('client');
    }

    public function show(Company $company) {
        return $company->load('client', 'services');
    }

    public function update(Request $request, Company $company) {
        $data = $request->validate([
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('companies', 'name')
                    ->where(fn ($q) => $q->where('client_id', $company->client_id))
                    ->ignore($company->id),
            ],
            'phone'   => 'nullable|string|max:50',
            'email'   => 'nullable|email',
            'address' => 'nullable|string|max:255',
        ]);
        $company->update($data);
        return $company;
    }

    public function destroy(Company $company) {
        $company->delete();
        return response()->json(['message' => 'Deleted']);
    }
}