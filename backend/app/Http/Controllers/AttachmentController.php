<?php
namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Edit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller {
    public function index(Request $request) {
        $q = Attachment::with('edit.client');
        if ($editId = $request->query('edit_id')) $q->where('edit_id', $editId);
        return $q->latest()->paginate(20);
    }

    public function store(Request $request, Edit $edit) {
        $request->validate([
            'file' => 'required|file|max:20480|mimes:pdf,png,jpg,jpeg,gif,webp,doc,docx,xls,xlsx,txt,zip',
        ]);
        $file = $request->file('file');
        $path = $file->store('attachments', 'public');

        $attachment = Attachment::create([
            'edit_id' => $edit->id,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json($attachment->load('edit.client'), 201);
    }

    public function download(Attachment $attachment) {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        return Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->original_name
        );
    }

    public function destroy(Attachment $attachment) {
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();
        return response()->json(['message' => 'Deleted']);
    }
}