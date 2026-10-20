<?php
namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller {
    public function index(Request $request) {
        $q = Service::with('company.client')->withCount('edits');

        if ($companyId = $request->query('company_id')) {
            $q->where('company_id', $companyId);
        }
        if ($search = $request->query('search')) {
            $q->where('name', 'like', "%$search%");
        }
        return $q->latest()->paginate(15);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'company_id'  => 'required|exists:companies,id',
            'name'        => [
                'required', 'string', 'max:255',
                Rule::unique('services', 'name')
                    ->where(fn ($q) => $q->where('company_id', $request->input('company_id'))),
            ],
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric|min:0',
        ]);

        return Service::create($data)->load('company');
    }

    public function show(Service $service) {
        return $service->load('company.client', 'edits');
    }

    public function update(Request $request, Service $service) {
        $data = $request->validate([
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('services', 'name')
                    ->where(fn ($q) => $q->where('company_id', $service->company_id))
                    ->ignore($service->id),
            ],
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric|min:0',
        ]);
        $service->update($data);
        return $service;
    }

    public function destroy(Service $service) {
        $service->delete();
        return response()->json(['message' => 'Deleted']);
    }
}