<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Company extends Model {
    protected $fillable = ['client_id','name','phone','email','address'];

    public function client()   { return $this->belongsTo(Client::class); }
    public function services() { return $this->hasMany(Service::class); }
    public function edits()    { return $this->hasManyThrough(Edit::class, Service::class); }
}