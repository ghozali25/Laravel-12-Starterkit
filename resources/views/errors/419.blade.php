@php
  $code = 419;
  $message = $message ?? __('Page Expired');
  $description = $description ?? __('Your session has expired, please refresh and try again.');
@endphp
@include('errors.404')
