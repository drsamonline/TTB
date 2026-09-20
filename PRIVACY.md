# Privacy

TTB is designed for local/offline use. The extension does not contain an analytics or telemetry service.

Some tools require Chrome privileged APIs or access to the active tab because their purpose is to inspect or modify browser state. Those operations are performed through the permissions declared in `manifest.json`.

Phase 7 libraries are not fetched from the network. If a required local vendor file is absent, the tool reports that dependency as unavailable.
