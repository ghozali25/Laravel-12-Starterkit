@php
  $code = 500;
  $message = $message ?? __('Server Error');
  $description = $description ?? __('Something went wrong on our end. Please try again later.');
@endphp
@include('errors.404')
