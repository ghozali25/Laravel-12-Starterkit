<!DOCTYPE html>
<html>
<head>
    <title>Asset List</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Asset List</h1>
    <table>
        <thead>
            <tr>
                <th>Kategori</th>
                <th>Serial Number</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Status</th>
                <th>Ditugaskan Kepada</th>
                <th>Tanggal Pembelian</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($assets as $asset): ?>
                <tr>
                    <td><?php echo e($asset->category->name ?? '-'); ?></td>
                    <td><?php echo e($asset->serial_number ?? '-'); ?></td>
                    <td><?php echo e($asset->brand ?? '-'); ?></td>
                    <td><?php echo e($asset->model ?? '-'); ?></td>
                    <td><?php echo e($asset->status); ?></td>
                    <td><?php echo e($asset->user->name ?? '-'); ?></td>
                    <td><?php echo e($asset->purchase_date ? $asset->purchase_date->format('Y-m-d') : '-'); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>