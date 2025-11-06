@php
  $code = 504;
  $message = $message ?? __('Gateway Timeout');
  $description = $description ?? __('The upstream server failed to send a request in time.');
@endphp
@include('errors.404')
