@php
  $code = 503;
  $message = $message ?? __('Service Unavailable');
  $description = $description ?? __('The service is temporarily unavailable. Please try again later.');
@endphp
@include('errors.404')
