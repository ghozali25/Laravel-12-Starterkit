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
        $seoTitle = $seo['title'] ?? $appName;
        $metaDescription = $seo['description'] ?? 'Aplikasi manajemen aset modern yang membantu mengelola inventaris, karyawan, dan proses operasional secara efisien.';
        $canonicalUrl = config('app.url');
    @endphp

    <title inertia>{{ $seoTitle }}</title>
    <meta name="description" content="{{ $metaDescription }}">

    @if (!empty($canonicalUrl))
        <link rel="canonical" href="{{ rtrim($canonicalUrl, '/') }}" />
    @endif

    <meta property="og:type" content="website" />
    <meta property="og:title" content="{{ $seoTitle }}" />
    <meta property="og:description" content="{{ $metaDescription }}" />
    @if (!empty($canonicalUrl))
        <meta property="og:url" content="{{ rtrim($canonicalUrl, '/') }}" />
    @endif

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $seoTitle }}" />
    <meta name="twitter:description" content="{{ $metaDescription }}" />

    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

    @php
        $favicon = $page['props']->setting->favicon ?? null;
    @endphp

    @if (!empty($favicon))
        <link rel="icon" href="{{ asset('storage/' . $favicon) }}" type="image/png">
        <meta property="og:image" content="{{ asset('storage/' . $favicon) }}" />
        <meta name="twitter:image" content="{{ asset('storage/' . $favicon) }}" />
    @else
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
    @endif


    @routes
    @if (!app()->environment('testing'))
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
    @endif
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
