# Unit 11: MQTT Telemetry (Optional)

## Do not start this unit unless Units 01–10 are fully verified and time
remains before the deadline. This is explicitly optional per the brief —
"the required solution and tests must still pass when MQTT is not
implemented." Cutting this unit costs zero points on the core rubric.

## Goal

Optionally collect washing/drying telemetry from a local Mosquitto
simulation, feeding into the same `raw_records` → `canonical_events`
pipeline as the other three sources, tagged `WASHING`/`DRYING`.

## Design

No new UI screens — MQTT appears as a fourth `SourceCard` in the existing
Data Sources UI (Unit 09), reusing all existing components.

## Implementation

### docker-compose.yml addition

- `mosquitto` service (`eclipse-mosquitto` image), exposing 1883, with a
  minimal config allowing anonymous local connections (fine for a local
  simulation fixture).

### fixtures/mqtt-simulator/

- A small script publishing simulated telemetry messages periodically to
  topics like `factory/line1/washing/telemetry` and
  `factory/line1/drying/telemetry`, payload: `{ batchId, temperature,
  timestamp }` or similar.

### MqttCollector

- `test()` — attempts to connect to the broker, subscribes briefly,
  confirms at least one message class is reachable.
- `discoverSchema()` — returns the known topic list and payload shape
  (static, since MQTT has no schema registry) for this fixture.
- `collect(config)` — subscribes for a bounded window (e.g. 10 seconds) or
  until N messages received, writes each message as a raw record tagged
  `WASHING` or `DRYING` based on topic.

## Dependencies

- `mqtt` (npm package, MQTT.js client)

## Verify when done

- [ ] `docker compose up` still works with mosquitto added, no impact on
      Units 01–10
- [ ] MQTT collector, when run, produces canonical events for
      WASHING/DRYING that appear correctly in the Production Lines UI
- [ ] All Unit 01–10 tests/checklists still pass with MQTT present
      (confirms it was additive, not load-bearing)
- [ ] `progress-tracker.md` updated: Unit 11 moved to Completed (or
      explicitly marked "cut due to time" if not attempted — that is a
      valid, expected outcome)
