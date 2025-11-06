@php
  $code = 502;
  $message = $message ?? __('Bad Gateway');
  $description = $description ?? __('The server received an invalid response from the upstream server.');
@endphp
@include('errors.404')
