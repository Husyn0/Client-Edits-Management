<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Client extends Model {
    protected $fillable = [
        'name','phone','email','company_name','service','last_contact_followup'
    ];
    public function edits() { return $this->hasMany(Edit::class); }
}