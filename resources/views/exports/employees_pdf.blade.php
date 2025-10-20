<!DOCTYPE html>
<html>
<head>
    <title>Employee List</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Employee List</h1>
    <table>
        <thead>
            <tr>
                <th>NIK</th>
                <th>Nama Karyawan</th>
                <th>Email Perusahaan</th>
                <th>Email Pribadi</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Divisi</th> <!-- Tambahkan ini -->
                <th>Roles</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($employees as $employee): ?>
                <tr>
                    <td><?php echo e($employee->nik); ?></td>
                    <td><?php echo e($employee->name); ?></td>
                    <td><?php echo e($employee->email); ?></td>
                    <td><?php echo e($employee->personal_email); ?></td>
                    <td><?php echo e($employee->phone_number); ?></td>
                    <td><?php echo e($employee->address); ?></td>
                    <td><?php echo e($employee->division->name ?? '-'); ?></td> <!-- Tampilkan nama divisi -->
                    <td><?php echo e($employee->roles->pluck('name')->implode(', ')); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>