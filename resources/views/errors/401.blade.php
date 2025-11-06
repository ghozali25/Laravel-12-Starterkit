@php
  $code = 401;
  $message = $message ?? __('Unauthorized');
  $description = $description ?? __('You are not authorized to access this page.');
@endphp
@include('errors.404')
