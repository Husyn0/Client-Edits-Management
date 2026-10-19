<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model {
    protected $fillable = ['company_id','name','description','base_price'];
    protected $casts = ['base_price' => 'decimal:2'];

    public function company() { return $this->belongsTo(Company::class); }
    public function edits()   { return $this->hasMany(Edit::class); }
}