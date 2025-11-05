<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Inertia\Inertia;

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

        return Inertia::render('backup/Index', [
            'backups' => $backups,
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

        // Build mysql client command (Windows-friendly quoting)
        $binPath = env('DB_DUMP_COMMAND_PATH', '');
        if ($binPath !== '') {
            $binPath = trim($binPath, "\"' \t\r\n");
            $binPath = rtrim($binPath, "\\/");
            $binPath = str_replace('\\', '/', $binPath);
        }
        $mysqlBin = $binPath ? ($binPath . '/mysql.exe') : 'mysql';

        $host = (string) env('DB_HOST', '127.0.0.1');
        $port = (string) env('DB_PORT', '3306');
        $user = (string) env('DB_USERNAME', 'root');
        $pass = (string) env('DB_PASSWORD', '');
        $db   = (string) env('DB_DATABASE', 'laravel');

        // Build params (no shell). Use -e to execute SOURCE command.
        $sqlPath = str_replace('\\', '/', $sqlFile);
        $args = [
            $mysqlBin,
            '--host=' . $host,
            '--port=' . $port,
            '--user=' . $user,
        ];
        if ($pass !== '') { $args[] = '--password=' . $pass; }
        $args[] = $db;
        $args[] = '-e';
        $args[] = 'SOURCE ' . $sqlPath;

        // Log and run without shell
        Log::info('[Backup Restore] Starting restore', [
            'zip' => $zipPath,
            'sql' => $sqlFile,
            'mysql' => $mysqlBin,
            'host' => $host,
            'port' => $port,
            'db' => $db,
        ]);

        $process = new Process($args);
        $process->setTimeout(600);
        $process->run();

        // Cleanup temp dir
        try { File::deleteDirectory($tempDir); } catch (\Throwable $e) {}

        if (!$process->isSuccessful()) {
            Log::error('[Backup Restore] Failed', [
                'exit_code' => $process->getExitCode(),
                'error' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
            ]);
            return redirect()->back()->with('error', 'Restore gagal: ' . trim($process->getErrorOutput() ?: $process->getOutput()));
        }

        Log::info('[Backup Restore] Success', [
            'output' => $process->getOutput(),
        ]);
        return redirect()->back()->with('success', 'Database berhasil direstore dari backup.');
    }
}
