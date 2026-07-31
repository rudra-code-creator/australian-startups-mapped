2026-07-31: Fixed mojibake and success handling for SuggestForm

- Ensured success copy is the exact UTF-8 string with em dash:
  "Thanks — we'll review before it appears on the map."
- Only show success UI when the POST JSON response includes `status === "pending"`.
- Kept local `pending` boolean solely to disable the form while the request is in flight.
- Fixed other UI strings to use proper Unicode (ellipsis, arrows).

Committed: fix: correct suggest form success copy encoding

