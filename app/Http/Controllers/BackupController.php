<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\Asset;
use App\Models\Vendor;

class BackupController extends Controller
{
    // Common backup locations
    protected array $backupPaths = [
        'laravel-backups',              // Spatie default
        'private/Laravel',              // Legacy custom path in this project
        'private/Starter-Kits',         // Actual path seen on this project
        'backups',                      // Generic fallback
    ];

    public function index()
    {
        $allFiles = collect();
        foreach ($this->backupPaths as $p) {
            $realPath = storage_path('app/' . $p);
            if (File::exists($realPath)) {
                // Use allFiles to include files in nested folders (Spatie groups by app name)
                $files = File::allFiles($realPath);
                foreach ($files as $f) {
                    $allFiles->push([$p, $f]);
                }
            }
        }

        $backups = $allFiles
            ->filter(function($pair){
                [$path, $file] = $pair;
                return in_array($file->getExtension(), ['zip','gz']);
            })
            ->map(function($pair){
                [$path, $file] = $pair;
                $full = $file->getPathname();
                $relative = ltrim(str_replace(storage_path('app/'), '', $full), DIRECTORY_SEPARATOR);
                return [
                    'name' => $file->getFilename(),
                    'size' => $file->getSize(),
                    'last_modified' => $file->getMTime(),
                    'download_url' => route('backup.download', ['file' => $relative]),
                    'relative' => $relative,
                    'path' => $path,
                ];
            })
            ->sortByDesc('last_modified')
            ->values();

        // Soft-deleted data for Trash tab (limit to avoid heavy payloads)
        $limit = (int) request()->integer('trash_limit', 50);
        $trash = [
            'users' => User::onlyTrashed()->select('id','name','email','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'tickets' => Ticket::onlyTrashed()->select('id','ticket_number','title','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'ticket_comments' => TicketComment::onlyTrashed()->select('id','ticket_id','user_id','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'assets' => Asset::onlyTrashed()->select('id','serial_number','brand','model','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'vendors' => Vendor::onlyTrashed()->select('id','name','deleted_at')->latest('deleted_at')->limit($limit)->get(),
        ];

        return Inertia::render('backup/Index', [
            'backups' => $backups,
            'trash' => $trash,
        ]);
    }

    public function run()
    {
        try {
            // Queue the backup to run in the background to keep UI responsive
            Artisan::queue('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);
            return redirect()->back()->with('success', 'Backup sedang diproses di background. Pastikan queue worker berjalan.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal memulai backup: ' . $e->getMessage());
        }
    }

    public function download($file)
    {
        // 'file' is a relative path under storage/app (may include subfolders)
        $path = storage_path('app/' . ltrim($file, '/\\'));

        if (!file_exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->download($path);
    }

    public function delete($file)
    {
        // First assume 'file' is a relative path under storage/app
        $candidate = storage_path('app/' . ltrim($file, '/\\'));
        $path = null;
        if (file_exists($candidate)) {
            $path = $candidate;
        } else {
            // Fallback: search by basename across known backup paths
            $basename = basename($file);
            foreach ($this->backupPaths as $p) {
                $try = storage_path('app/' . $p . '/' . $basename);
                if (file_exists($try)) { $path = $try; break; }
            }
        }

        if (!$path || !file_exists($path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        @unlink($path);

        return redirect()->back()->with('success', 'Backup berhasil dihapus.');
    }

    public function restore(Request $request)
    {
        $file = $request->input('file');
        if (!$file) {
            return redirect()->back()->with('error', 'Parameter file wajib diisi.');
        }

        // Resolve backup absolute path
        $zipPath = storage_path('app/' . ltrim($file, '/\\'));
        if (!file_exists($zipPath)) {
            // fallback search by basename across known paths
            $basename = basename($file);
            $zipPath = null;
            foreach ($this->backupPaths as $p) {
                $try = storage_path('app/' . $p . '/' . $basename);
                if (file_exists($try)) { $zipPath = $try; break; }
            }
            if (!$zipPath) {
                return redirect()->back()->with('error', 'File backup tidak ditemukan.');
            }
        }

        // Prepare temp dir
        $tempDir = storage_path('app/backup-temp/restore_' . time());
        if (!is_dir($tempDir)) { @mkdir($tempDir, 0777, true); }

        $sqlFile = null;
        $ext = strtolower(pathinfo($zipPath, PATHINFO_EXTENSION));

        if ($ext === 'zip') {
            $zip = new \ZipArchive();
            if ($zip->open($zipPath) !== true) {
                return redirect()->back()->with('error', 'Gagal membuka file ZIP backup.');
            }
            $zip->extractTo($tempDir);
            $zip->close();

            $rii = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($tempDir));
            foreach ($rii as $f) {
                if ($f->isDir()) continue;
                if (strtolower($f->getExtension()) === 'sql') { $sqlFile = $f->getPathname(); break; }
                if (strtolower($f->getExtension()) === 'gz' && preg_match('/\.sql\.gz$/i', $f->getFilename())) {
                    $target = $tempDir . '/' . preg_replace('/\.gz$/i', '', $f->getFilename());
                    $gz = @gzopen($f->getPathname(), 'rb');
                    if ($gz) {
                        $out = @fopen($target, 'wb');
                        if ($out) {
                            while (!gzeof($gz)) { fwrite($out, gzread($gz, 8192)); }
                            fclose($out);
                            $sqlFile = $target;
                        }
                        gzclose($gz);
                    }
                    if ($sqlFile) { break; }
                }
            }
            if (!$sqlFile) {
                return redirect()->back()->with('error', 'Tidak ditemukan berkas .sql di dalam backup.');
            }
        } elseif ($ext === 'gz') {
            if (!preg_match('/\.sql\.gz$/i', $zipPath)) {
                return redirect()->back()->with('error', 'Format .gz tidak dikenali. Harap pilih file .sql.gz atau arsip .zip.');
            }
            $baseName = basename($zipPath, '.gz');
            $target = $tempDir . '/' . $baseName;
            $gz = @gzopen($zipPath, 'rb');
            if (!$gz) {
                return redirect()->back()->with('error', 'Gagal membuka file .gz.');
            }
            $out = @fopen($target, 'wb');
            if (!$out) {
                gzclose($gz);
                return redirect()->back()->with('error', 'Gagal menulis file sementara untuk restore.');
            }
            while (!gzeof($gz)) { fwrite($out, gzread($gz, 8192)); }
            fclose($out);
            gzclose($gz);
            $sqlFile = $target;
        } else {
            return redirect()->back()->with('error', 'Format backup tidak didukung. Harap pilih .zip atau .sql.gz');
        }

        // Ensure SQL file is readable before proceeding
        if (!$sqlFile || !is_file($sqlFile) || !is_readable($sqlFile)) {
            return redirect()->back()->with('error', 'Berkas SQL tidak ditemukan atau tidak bisa dibaca.');
        }

        // Build mysql client command (Windows-friendly quoting)
        $binPath = env('DB_DUMP_COMMAND_PATH', '');
        if ($binPath !== '') {
            $binPath = trim($binPath, "\"' \t\r\n");
            $binPath = rtrim($binPath, "\\/");
            $binPath = str_replace('\\', '/', $binPath);
        }
        $isWindows = (PHP_OS_FAMILY ?? (stripos(PHP_OS, 'WIN') === 0 ? 'Windows' : 'Unknown')) === 'Windows';
        $clientPref = strtolower((string) env('DB_MYSQL_CLIENT', 'auto'));
        if ($clientPref === 'mariadb') {
            $mysqlExec = $isWindows ? 'mariadb.exe' : 'mariadb';
        } elseif ($clientPref === 'mysql') {
            $mysqlExec = $isWindows ? 'mysql.exe' : 'mysql';
        } else {
            // auto: default to mysql, many MariaDB installs provide 'mysql' shim
            $mysqlExec = $isWindows ? 'mysql.exe' : 'mysql';
        }
        $mysqlBin = $binPath ? ($binPath . '/' . $mysqlExec) : $mysqlExec;

        $host = (string) env('DB_HOST', '127.0.0.1');
        $port = (string) env('DB_PORT', '3306');
        $user = (string) env('DB_USERNAME', 'root');
        $pass = (string) env('DB_PASSWORD', '');
        $db   = (string) env('DB_DATABASE', 'laravel');

        // Build params (no shell). We will stream the SQL via STDIN to avoid SOURCE path issues on Windows.
        $protocol = strtolower(trim((string) env('DB_MYSQL_PROTOCOL', '')));
        $socket = (string) env('DB_SOCKET', '');
        $args = [ $mysqlBin, '--user=' . $user ];
        if ($protocol === 'pipe') {
            $args[] = '--protocol=pipe';
            if ($socket !== '') { $args[] = '--socket=' . $socket; }
        } else {
            // default to TCP
            if ($protocol !== '' && $protocol !== 'tcp') { $args[] = '--protocol=' . $protocol; }
            $args[] = '--host=' . $host;
            $args[] = '--port=' . $port;
        }
        if ($pass !== '') { $args[] = '--password=' . $pass; }
        $args[] = '--force';
        $args[] = '--default-character-set=utf8mb4';
        $args[] = $db;

        // Log and run without shell
        Log::info('[Backup Restore] Starting restore', [
            'zip' => $zipPath,
            'sql' => $sqlFile,
            'mysql' => $mysqlBin,
            'host' => $host,
            'port' => $port,
            'db' => $db,
            'protocol' => $protocol ?: 'tcp(default)',
            'socket' => $socket,
        ]);

        // Pre-step: ensure target database exists
        try {
            $createArgs = [$mysqlBin, '--user=' . $user];
            if ($protocol === 'pipe') {
                $createArgs[] = '--protocol=pipe';
                if ($socket !== '') { $createArgs[] = '--socket=' . $socket; }
            } else {
                if ($protocol !== '' && $protocol !== 'tcp') { $createArgs[] = '--protocol=' . $protocol; }
                $createArgs[] = '--host=' . $host;
                $createArgs[] = '--port=' . $port;
            }
            if ($pass !== '') { $createArgs[] = '--password=' . $pass; }
            $createArgs[] = '-e';
            $createArgs[] = 'CREATE DATABASE IF NOT EXISTS `' . $db . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;';
            $create = new Process($createArgs);
            $create->disableOutput();
            $create->setTimeout(60);
            $create->run();
        } catch (\Throwable $e) {
            Log::warning('[Backup Restore] Failed to pre-create database (will continue)', ['message' => $e->getMessage()]);
        }

        $process = null;
        $fallbackTried = false;

        if ($isWindows) {
            // Prefer shell redirection on Windows to avoid pipe issues
            $buildArg = function(string $a) {
                if ($a === '') { return '""'; }
                $needs = preg_match('/\s|[<>|&]/', $a);
                $a = str_replace('"', '\\"', $a);
                return $needs ? '"' . $a . '"' : $a;
            };
            $parts = array_map($buildArg, $args);
            $sqlQuoted = '"' . str_replace('"', '\\"', str_replace('\\', '/', $sqlFile)) . '"';
            $diagFile = storage_path('logs/restore-mysql-' . time() . '.log');
            $diagQuoted = '"' . str_replace('"', '\\"', str_replace('\\', '/', $diagFile)) . '"';
            $cmdline = implode(' ', $parts) . ' < ' . $sqlQuoted . ' > ' . $diagQuoted . ' 2>&1';
            Log::info('[Backup Restore] Using Windows shell redirection', [ 'cmd' => $cmdline, 'diag' => $diagFile ]);
            $process = Process::fromShellCommandline($cmdline);
            $process->disableOutput();
            $process->setTimeout((int) env('DB_RESTORE_TIMEOUT', 1800));
            $process->run();
        } else {
            // Non-Windows: stream via STDIN and disable output capture to avoid fread on closed pipes
            $proc = new Process($args);
            $proc->disableOutput();
            $proc->setTimeout((int) env('DB_RESTORE_TIMEOUT', 1800));
            $in = @fopen($sqlFile, 'rb');
            try {
                if ($in !== false) { $proc->setInput($in); }
                $proc->run();
            } finally {
                if (is_resource($in)) { @fclose($in); }
            }
            $process = $proc;
        }

        // Cleanup temp dir
        try { File::deleteDirectory($tempDir); } catch (\Throwable $e) {}

        if (!$process || !$process->isSuccessful()) {
            $snippet = null;
            if (isset($diagFile) && is_string($diagFile) && file_exists($diagFile)) {
                $size = @filesize($diagFile);
                $read = 4000;
                $start = ($size && $size > $read) ? ($size - $read) : 0;
                $fh = @fopen($diagFile, 'rb');
                if ($fh) {
                    if ($start > 0) { @fseek($fh, $start); }
                    $snippet = @stream_get_contents($fh) ?: null;
                    @fclose($fh);
                }
            }

            // Windows-specific auto-retry: if TCP socket creation failed (ERROR 2004), try named pipe
            $retriedPipe = false;
            if ($isWindows && $snippet && str_contains($snippet, 'ERROR 2004')) {
                $pipeName = (string) env('DB_SOCKET', '\\\\.\\pipe\\MySQL');
                $buildArg = function(string $a) {
                    if ($a === '') { return '""'; }
                    $needs = preg_match('/\s|[<>|&]/', $a);
                    $a = str_replace('"', '\\"', $a);
                    return $needs ? '"' . $a . '"' : $a;
                };
                $pipeArgs = [$mysqlBin, '--user=' . $user, '--protocol=pipe', '--socket=' . $pipeName, '--force', '--default-character-set=utf8mb4', $db];
                if ($pass !== '') { array_splice($pipeArgs, 2, 0, ['--password=' . $pass]); }
                $parts2 = array_map($buildArg, $pipeArgs);
                $sqlQuoted2 = '"' . str_replace('"', '\\"', str_replace('\\', '/', $sqlFile)) . '"';
                $diagFile2 = storage_path('logs/restore-mysql-pipe-' . time() . '.log');
                $diagQuoted2 = '"' . str_replace('"', '\\"', str_replace('\\', '/', $diagFile2)) . '"';
                $cmdline2 = implode(' ', $parts2) . ' < ' . $sqlQuoted2 . ' > ' . $diagQuoted2 . ' 2>&1';
                Log::info('[Backup Restore] Retrying via named pipe', [ 'cmd' => $cmdline2, 'diag' => $diagFile2 ]);
                $proc2 = Process::fromShellCommandline($cmdline2);
                $proc2->disableOutput();
                $proc2->setTimeout((int) env('DB_RESTORE_TIMEOUT', 1800));
                $proc2->run();
                if ($proc2->isSuccessful()) {
                    $process = $proc2;
                } else {
                    $retriedPipe = true;
                    // read tail of pipe diag
                    $snippet2 = null;
                    $size2 = @filesize($diagFile2);
                    $start2 = ($size2 && $size2 > 4000) ? ($size2 - 4000) : 0;
                    $fh2 = @fopen($diagFile2, 'rb');
                    if ($fh2) {
                        if ($start2 > 0) { @fseek($fh2, $start2); }
                        $snippet2 = @stream_get_contents($fh2) ?: null;
                        @fclose($fh2);
                    }
                    Log::error('[Backup Restore] Pipe retry failed', [
                        'exit_code' => $proc2->getExitCode(),
                        'diag_tail' => $snippet2,
                    ]);
                }
            }

            if (!$process || !$process->isSuccessful()) {
                Log::error('[Backup Restore] Failed', [
                    'exit_code' => $process ? $process->getExitCode() : null,
                    'fallback' => $isWindows ? ($retriedPipe ? 'pipe' : 'shell_redirection') : 'stdin_stream',
                    'diag_tail' => $snippet,
                ]);
                return redirect()->back()->with('error', 'Gagal melakukan restore database. Cek log untuk detail.');
            }
        }

        Log::info('[Backup Restore] Success');
        return redirect()->back()->with('success', 'Database berhasil direstore dari backup.');
    }

    /**
     * Restore a soft-deleted record by model key and id.
     */
    public function trashRestore(Request $request)
    {
        $modelKey = (string) $request->input('model');
        $id = $request->input('id');
        $class = $this->resolveTrashModel($modelKey);
        if (!$class) {
            return redirect()->back()->with('error', 'Model tidak dikenali.');
        }
        $row = $class::withTrashed()->find($id);
        if (!$row) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }
        $row->restore();
        return redirect()->back()->with('success', 'Data berhasil direstore.');
    }

    /**
     * Permanently delete a soft-deleted record by model key and id.
     */
    public function trashForceDelete(Request $request)
    {
        $modelKey = (string) $request->input('model');
        $id = $request->input('id');
        $class = $this->resolveTrashModel($modelKey);
        if (!$class) {
            return redirect()->back()->with('error', 'Model tidak dikenali.');
        }
        $row = $class::withTrashed()->find($id);
        if (!$row) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }
        $row->forceDelete();
        return redirect()->back()->with('success', 'Data dihapus permanen.');
    }

    protected function resolveTrashModel(string $key): ?string
    {
        $map = [
            'users' => User::class,
            'tickets' => Ticket::class,
            'ticket_comments' => TicketComment::class,
            'assets' => Asset::class,
            'vendors' => Vendor::class,
        ];
        return $map[$key] ?? null;
    }
}
