@php
  $code = 429;
  $message = $message ?? __('Too Many Requests');
  $description = $description ?? __('You have sent too many requests. Please slow down and try again later.');
@endphp
@include('errors.404')
