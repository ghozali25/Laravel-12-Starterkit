@php
  $code = 403;
  $message = $message ?? __('Forbidden');
  $description = $description ?? __('You do not have permission to access this resource.');
@endphp
@include('errors.404')
