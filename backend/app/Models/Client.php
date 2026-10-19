<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Client extends Model {
    protected $fillable = [
        'name','phone','email','last_contact_followup'
    ];

    public function companies() { return $this->hasMany(Company::class); }
    public function edits()     { return $this->hasMany(Edit::class); }

    // Convenience: all services under this client
    public function services() {
        return $this->hasManyThrough(Service::class, Company::class);
    }
}