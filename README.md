# loopback-connector-memory-stringid
Memory connector for Loopback to replace standard Memory connector's ID generation function.

The default `loopback-connector-memory` uses `Number` IDs which are not compatible with our scaffolding data set. Originally this was not an issue as we used a boot script to change over from using the standard MongoDB connector to this patched version but with an update of loopback behaviour changed. In current version it will set up the connectors before boot scripts run and would then either fail on systems not running mongodb ( our test server ) or if not it would fail becuase the initial scaffolding would have `NaN` as an ID since the hexadecimal ID strings would not parse to a number.

This code should be considered ours and therefore have tests added to it before release. The memory connector is SOUP and therefore does not need unit tests in this package.
