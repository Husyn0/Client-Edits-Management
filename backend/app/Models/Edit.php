<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Edit extends Model {
    protected $fillable = [
        'client_id','service_id','title','description','due_date','priority',
        'payment','is_paid','status'
    ];
    protected $casts = [
        'is_paid'  => 'boolean',
        'due_date' => 'date',
        'payment'  => 'decimal:2',
    ];

    public function client()      { return $this->belongsTo(Client::class); }
    public function service()     { return $this->belongsTo(Service::class); }
    public function attachments() { return $this->hasMany(Attachment::class); }
}