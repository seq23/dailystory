-- PostgREST supports a client-selected timezone. Keep quota fingerprints stable
-- across those requests by executing the insert guard in UTC.
alter function diagnostic_private.guard_insert() set timezone = 'UTC';
