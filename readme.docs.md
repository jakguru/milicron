# Milicron

A simple Cron Daemon designed originally to be run in-browser, but compatible with both NodeJS and the browser,
which supports a resolution of up to 10ms.

![Doc Coverage Badge](./coverage.svg)

## Supported cron expressions:

### Crontab format:

```text
  *    *    *    *    *    *    *
  ┬    ┬    ┬    ┬    ┬    ┬    ┬
  │    │    │    │    │    │    |
  │    │    │    │    │    │    └ day of week (0 - 7, 1L - 7L) (0 or 7 is Sun)
  │    │    │    │    │    └───── month (1 - 12)
  │    │    │    │    └────────── day of month (1 - 31, L)
  │    │    │    └─────────────── hour (0 - 23)
  │    │    └──────────────────── minute (0 - 59)
  |    └───────────────────────── second (0 - 59, optional)
  └────────────────────────────── millisecond (0 - 999, optional)*
 ```

**Important Note**: While the millisecond field accepts values of 0-999, the resolution of the cron daemon is limited to 10ms, meaning that the job may trigger up to 10ms before or 10ms after the expressions's defined time.

Additionally, the library also accepts mixed use of ranges and range increments (except for `W`). The parsing on the [cron-parser](https://www.npmjs.com/package/cron-parser) library, with modifications to allow supporting of milisecond expressions.

#### Examples:

* `* * * * * * *` - Every 10ms
* `*/2 * * * * * *` - Every 10ms (due to the 10ms resolution)
* `*/100 * * * * *` - Every 100ms
* `0 * * * * * *` - Every second
* `0 0 * * * * *` - Every minute

For more information on the crontab format, see [crontab.guru](https://crontab.guru/) or [cronjob.xyz](https://cronjob.xyz/).
Note that these don't accept the exact same syntax as this library, as they do not accept the millisecond or seconds fields.

### Crontab aliases:

* `@yearly` - Once a year, at midnight on the morning of January 1st
* `@monthly` - Once a month, at midnight on the morning of the first day of the month
* `@weekly` - Once a week, at midnight on Sunday morning
* `@daily` - Once a day, at midnight
* `@hourly` - Once an hour, at the beginning of the hour

### Unix Timestamp (seconds)

A unix timestamp in seconds can be used to specify a single time to run the job.
**Important Note**: It is highly recommended to use the `$once` method with unix timestamps instead of `$on` in order to clear the callback after the job has run.

## Installation

```bash
npm install @jakguru/milicron
```

or

```bash
yarn add @jakguru/milicron
```

## Usage

### Import / Require the library

```typescript
import { MiliCron } from '@jakguru/milicron'
```

or

```typescript
import MiliCron from '@jakguru/milicron'
```

or

```javascript
const { MiliCron } = require('@jakguru/milicron')
```

### Create a new instance of the client

```typescript
const daemon = new MiliCron()
daemon.start() // optional. you can delay starting until you've added jobs too.
```

### Add cron jobs

```typescript
daemon.$on('* * * * *', () => {
  // this runs once per minute
})

cron.$once("1704067200", () => {
  // This is set to run at midnight on January 1st, 2024
  console.log('Happy New Year!');
});

cron.$once(DateTime.now().toUTC().plus({ seconds: 10 }).toUnixInteger().toString(), () => {
  // This is set to run 10 seconds from now
  console.log("10 seconds later");
});
```

## API

### Static Methods

| Method | Description | Documentation |
| --- | --- | --- |
| `crontabMatchesDateTime` | Checks if a crontab expression matches a given Luxon DateTime object | [Documentation](./classes/MiliCron.html#crontabMatchesDateTime-2) |
| `getParsedCronExpression` | Returns either a Luxon DateTime object or a [CronTabObject](./interfaces/CronTabObject.html) with the matching configuration. | [Documentation](./classes/MiliCron.html#getParsedCronExpression-2) |

### Constructor

| Parameter | Type | Description |
| --- | --- | --- |
| `autostart` | `boolean` | Whether or not to start the daemon immediately. Defaults to `undefined` (`false`). |

### Instance Methods

| Method | Description | Documentation |
| --- | --- | --- |
| `$on` | Adds a new cron job to the daemon. Uses [EventEmitter.on](https://nodejs.org/docs/latest-v16.x/api/events.html#emitteroneventname-listener) under the hood | [Documentation](./classes/MiliCron.html#_on) |
| `$once` | Adds a new cron job to the daemon, but only runs it once. Uses [EventEmitter.once](https://nodejs.org/docs/latest-v16.x/api/events.html#emitteronceeventname-listener) under the hood | [Documentation](./classes/MiliCron.html#_once) |
| `$off` | Removes a cron job from the daemon. Uses [EventEmitter.off](https://nodejs.org/docs/latest-v16.x/api/events.html#emitteroffeventname-listener) under the hood | [Documentation](./classes/MiliCron.html#_off) |
| `$clear` | Removes all callbacks from either a specific crontab or the entire daemon. Uses [EventEmitter.removeAllListeners](https://nodejs.org/docs/latest-v16.x/api/events.html#emitterremovealllistenerseventname) under the hood | [Documentation](./classes/MiliCron.html#_clear) |
| `start` | Starts the daemon if not already started. | [Documentation](./classes/MiliCron.html#start) |
| `stop` | Stops the daemon if not already stopped. | [Documentation](./classes/MiliCron.html#stop) |
| `restart` | Stops and starts the daemon. | [Documentation](./classes/MiliCron.html#restart) |
| `crontabMatchesDateTime` | Checks if a crontab expression matches a given Luxon DateTime object | [Documentation](./classes/MiliCron.html#crontabMatchesDateTime) |
| `getParsedCronExpression` | Returns either a Luxon DateTime object or a [CronTabObject](./interfaces/CronTabObject.html) with the matching configuration. | [Documentation](./classes/MiliCron.html#getParsedCronExpression) |

### Instance Properties

| Property | Type | Description |
| --- | --- | --- |
| `running` | **readonly** `boolean` | Whether or not the daemon is currently running. |

## FAQ's

**Q: Why is the resolution limited to 10ms?**
This is mostly a limitation of the `setTimeout` function which is used to handle the `ticks`. As noted in [MDN's Documentation](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#reasons_for_delays_longer_than_specified), most browsers will enforce a minimum timeout of 4ms once a nested call to `setTimeout` has been scheduled 5 times.
Ticks can also be delayed if the OS / browser is busy with other tasks. While there can be cases where 10ms is not sufficient, it is a reasonable compromise between performance and accuracy.

## Credits and Acknowledgements

This library leverages the capabilities of the [Luxon](https://moment.github.io/luxon/) library for proficient parsing and matching of date and time. The foundation of the cron parsing functionality is built upon the [cron-parser](https://www.npmjs.com/package/cron-parser) library, albeit with custom modifications to accommodate millisecond expressions. The design and functionality of this library owe a significant debt to the inspiration derived from [node-cron](https://www.npmjs.com/package/cron).