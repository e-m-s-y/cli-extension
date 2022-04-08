# CLI Extension
A plugin with additional Command Line Interface commands to make prototyping easier and faster.

## Installation
Use these steps if you installed your node using Git clone.

1. Go to the plugin directory `cd ~/solar-core/plugins`.
2. Clone the plugin `git clone https://github.com/e-m-s-y/cli-extension -b solar`.
3. Install and build the plugin `cd cli-extension && pnpm install && pnpm build`.
4. Add the configuration to `~/.config/solar-core/{mainnet|testnet}/app.json` at the bottom of relay.plugins and / or core.plugins.
5. Restart your relay and / or core process(es).

#### Plugin configuration example
```js
{
    "package": "@foly/cli-extension"
}
```

## Usage

1. Go to core directory `cd ~/solar-core/packages/core`.
2. Execute command (replace $network and $command to your likings) `cross-env CORE_PATH_CONFIG=./bin/config/$network CORE_PATH_DATA=../../ ./bin/run $command`.

### Generate genesis transfer transaction command
Generates a transfer transaction from the genesis wallet.
```
Command: genesis:transfer:generate
Arguments:
    --recipientId (required)
    --passphrase (required)
    --network (default mainnet)
    --amount (default 1)
    --nonce (default 0)
    --fee (default 1)
```

### Generate self voting delegate wallet command
Generates a self voting delegate.
```
Command: genesis:delegate:generate
Arguments:
    --name (required)
    --passphrase (required)
    --network (default mainnet)
```

### Regenerate genesis block command
Regenerates the properties of a modified genesis block like payloadHash, payload and totalAmount.
```
Command: genesis:block:regenerate
Arguments:
    --passphrase (required)
    --network (default mainnet)
```

## Credits

- [e-m-s-y](https://github.com/e-m-s-y)

## License

[MIT](LICENSE.md)
