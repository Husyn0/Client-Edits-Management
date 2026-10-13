<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model {
    protected $fillable = ['edit_id','original_name','file_path','mime_type','size'];
    public function edit() { return $this->belongsTo(Edit::class); }
}