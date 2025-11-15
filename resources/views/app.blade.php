<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @if (!app()->environment('production'))
        <meta name="robots" content="noindex,nofollow">
    @endif

    @php
        $setting = $page['props']['setting'] ?? null;
        $appName = $setting['nama_app'] ?? config('app.name', 'Laravel');
        $favicon = $setting['favicon'] ?? null;
        $seo = $setting['seo'] ?? null;
        $metaDescription = $seo['description'] ?? 'Aplikasi manajemen aset modern yang membantu mengelola inventaris, karyawan, dan proses operasional secara efisien.';
    @endphp

    <title inertia>{{ $appName }}</title>
    <meta name="description" content="{{ $metaDescription }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @php
        $favicon = $page['props']->setting->favicon ?? null;
    @endphp

    @if (!empty($favicon))
        <link rel="icon" href="{{ asset('storage/' . $favicon) }}" type="image/png">
    @else
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
    @endif


    @routes
    @if (!app()->environment('testing'))
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
    @endif
    @inertiaHead
    <!-- SweetAlert2 CDN for global usage in React -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
