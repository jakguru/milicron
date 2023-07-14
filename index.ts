/**
 * @jakguru/milicron export the {@link MiliCron} class, {@link CronTabObject} interface, and {@link EventCallback} type.
 * It also renames and exports the {@link MiliCron} class as the default export.
 * @module @jakguru/milicron
 */

/**
 * Import the `EventEmitter` class from the `events` module.
 * @import { EventEmitter } from 'events'
 */
import { EventEmitter } from 'events'

/**
 * Import the `DateTime` class from the `luxon` module.
 * @import { DateTime } from 'luxon'
 */
import { DateTime } from 'luxon'

/**
 * A type representing a callback function for a MiliCron "crontab" event.
 * @typedef {(...args: unknown[]) => unknown} EventCallback
 */
export interface EventCallback {
  /**
   * A function that takes any number of arguments of any type and returns a value of any type.
   * @typedef {(...args: unknown[]) => unknown} EventCallback
   */
  (...args: unknown[]): unknown
}

/**
 * An interface representing a constraint for a cron expression field.
 * @interface CronExpressionConstraint
 * @property {number} min - The minimum value allowed for the field.
 * @property {number} max - The maximum value allowed for the field.
 * @property {string[]} chars - An array of characters that are allowed for the field.
 * @property {RegExp} validChars - A regular expression that matches all valid characters for the field.
 */
interface CronExpressionConstraint {
  min: number
  max: number
  chars: string[]
  validChars: RegExp
}

/**
 * An interface representing the parsed cron expression as sets of allowed values.
 * @interface CronTabObject
 * @property {Set<number>} millisecondly - A set of allowed milliseconds.
 * @property {Set<number>} secondly - A set of allowed seconds.
 * @property {Set<number>} minutely - A set of allowed minutes.
 * @property {Set<number>} hourly - A set of allowed hours.
 * @property {Set<number>} dayOfMonthly - A set of allowed days of the month.
 * @property {Set<number>} monthly - A set of allowed months.
 * @property {Set<number>} dayOfWeekly - A set of allowed days of the week.
 */
export interface CronTabObject {
  millisecondly: Set<number>
  secondly: Set<number>
  minutely: Set<number>
  hourly: Set<number>
  dayOfMonthly: Set<number>
  monthly: Set<number>
  dayOfWeekly: Set<number>
}

/**
 * A simple Cron Daemon which supports a resolution of up to 10ms.
 * @class MiliCron
 */
export class MiliCron {
  readonly #bus: EventEmitter
  #timeoutId?: NodeJS.Timeout
  #running: boolean = false

  /**
   * Creates a new instance of the MiliCron class.
   * @constructor
   * @param {boolean} [autostart=false] - Whether to automatically start the cron daemon upon instantiation.
   * @returns {MiliCron} - A new instance of the MiliCron class.
   */
  constructor(autostart?: boolean) {
    this.#bus = new EventEmitter({ captureRejections: true })
    this.#bus.setMaxListeners(Infinity)
    if (autostart === true) {
      this.start()
    }
  }

  /**
   * Starts the cron daemon if it is not already running.
   * @function
   * @returns {void}
   */
  public start(): void {
    if (this.#running) {
      return
    }
    this.#onTick()
  }

  /**
   * Stops the cron daemon if it is running.
   * @function
   * @returns {void}
   */
  public stop(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
    }
    this.#running = false
  }

  /**
   * Stops the cron daemon if it is running and then starts it again.
   * @function
   * @returns {void}
   */
  public restart(): void {
    this.stop()
    this.start()
  }

  /**
   * Returns a boolean indicating whether the cron daemon is currently running.
   * @readonly
   * @returns {boolean} - A boolean indicating whether the cron daemon is currently running.
   */
  public get running() {
    return this.#running
  }

  /**
   * Registers a callback function to be executed every time the specified event is emitted.
   * @param {string} event The name of the event to listen for.
   * @param {EventCallback} cb The callback function to execute when the event is emitted.
   * @see {@link events!EventEmitter.on | EventEmitter.on}
   */
  public $on(event: string, cb: EventCallback): void
  public $on(event: string, cb: EventCallback) {
    // TODO: Add validation to ensure that the event is a valid crontab and if we're dealing with a specific date/time, it should be in the future
    this.#bus.on(event, cb)
  }

  /**
   * Registers a callback function to be executed only once when the specified event is emitted.
   * @param {string} event The name of the event to listen for.
   * @param {EventCallback} cb The callback function to execute when the event is emitted.
   * @see {@link events!EventEmitter.once | EventEmitter.once}
   */
  public $once(event: string, cb: EventCallback): void
  public $once(event: string, cb: EventCallback) {
    // TODO: Add validation to ensure that the event is a valid crontab and if we're dealing with a specific date/time, it should be in the future
    this.#bus.once(event, cb)
  }

  /**
   * Removes a previously registered callback function for the specified event.
   * @param {string} event The name of the event to remove the callback function from.
   * @param {EventCallback} cb The callback function to remove.
   * @see {@link events!EventEmitter.off | EventEmitter.off}
   */
  public $off(event: string, cb: EventCallback): void
  public $off(event: string, cb: EventCallback) {
    this.#bus.off(event, cb)
  }

  /**
   * Removes all listeners for the specified event or all events if no event is specified.
   * @param {string} [event] - The name of the event to remove all listeners from.
   * @returns {void}
   * @see {@link events!EventEmitter.removeAllListeners | EventEmitter.removeAllListeners}
   */
  public $clear(event?: string): void {
    if (event) {
      this.#bus.removeAllListeners(event)
    } else {
      this.#bus.removeAllListeners()
    }
  }

  /**
   * Determines whether the given crontab expression matches the given date and time.
   * @param {string} crontab - The crontab expression to check.
   * @param {DateTime} now - The date and time to check against the crontab expression.
   * @returns {boolean} - A boolean indicating whether the crontab expression matches the given date and time.
   */
  public crontabMatchesDateTime(crontab: string, now: DateTime): boolean {
    return MiliCron.crontabMatchesDateTime(crontab, now)
  }

  /**
   * Parses the given cron expression and returns either a `DateTime` object representing the next time the cron expression will match, or a `CronTabObject` containing the parsed cron expression.
   * @param {string} cronExpression - The cron expression to parse.
   * @param {DateTime} [now] - The current date and time to use as a reference when calculating the next match time. If not provided, the current date and time will be used.
   * @throws {Error} - Throws an error if the cron expression is so invalid that it cannot be recognized, or if the `now` parameter is not a valid `DateTime` object.
   * @returns {DateTime | CronTabObject} - A `DateTime` object representing the next time the cron expression will match, or a `CronTabObject` containing the parsed cron expression.
   */
  public getParsedCronExpression(cronExpression: string, now?: DateTime): DateTime | CronTabObject {
    return MiliCron.getParsedCronExpression(cronExpression, now)
  }

  #onTick() {
    this.#running = true
    const now = DateTime.now().toUTC()
    const eventsWithListeners = this.#bus.eventNames()
    // now we need to parse through all of the events to see if any of them match the current time
    eventsWithListeners
      .filter((e) => 'error' !== e)
      .forEach((eventName: string | symbol) => {
        if (MiliCron.crontabMatchesDateTime(eventName.toString(), now)) {
          this.#bus.emit(eventName)
        }
      })
    this.#timeoutId = setTimeout(this.#onTick.bind(this), 10)
  }

  static get #crontabContraints() {
    const constraints = {
      millisecondly: {
        min: 0,
        max: 999,
        chars: [] as string[],
        validChars: /^[,*\d/-]+$/,
      } as CronExpressionConstraint,
      secondly: {
        min: 0,
        max: 59,
        chars: [] as string[],
        validChars: /^[,*\d/-]+$/,
      } as CronExpressionConstraint,
      minutely: {
        min: 0,
        max: 59,
        chars: [] as string[],
        validChars: /^[,*\d/-]+$/,
      } as CronExpressionConstraint,
      hourly: {
        min: 0,
        max: 23,
        chars: [] as string[],
        validChars: /^[,*\d/-]+$/,
      } as CronExpressionConstraint,
      dayOfMonthly: {
        min: 1,
        max: 31,
        chars: ['L'] as string[],
        validChars: /^[?,*\dL/-]+$/,
      } as CronExpressionConstraint,
      monthly: {
        min: 1,
        max: 12,
        chars: [] as string[],
        validChars: /^[,*\d/-]+$/,
      } as CronExpressionConstraint,
      dayOfWeekly: {
        min: 0,
        max: 7,
        chars: ['L'] as string[],
        validChars: /^[?,*\dL#/-]+$/,
      } as CronExpressionConstraint,
    }
    Object.freeze(constraints)
    return constraints
  }

  static get #aliases() {
    const aliases = {
      expressions: {
        '@yearly': '0 0 0 0 1 1 *',
        '@monthly': '0 0 0 0 1 * *',
        '@weekly': '0 0 0 0 * * 0',
        '@daily': '0 0 0 0 * * *',
        '@hourly': '0 0 0 * * * *',
      } as { [key: string]: string },
      month: {
        JAN: 1,
        FEB: 2,
        MAR: 3,
        APR: 4,
        MAY: 5,
        JUN: 6,
        JUL: 7,
        AUG: 8,
        SEP: 9,
        OCT: 10,
        NOV: 11,
        DEC: 12,
      } as { [key: string]: number },
      daysOfWeek: {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      } as { [key: string]: number },
    } as { [key: string]: any }
    Object.freeze(aliases)
    return aliases
  }

  /**
   * Convert the crontab expression into a Set of numbers which represent possible matches
   * @param field The crontab field we are parsing, for additional constraints
   * @param value The current value of the field
   * @param constraints The general constraints for the field
   * @returns A set of numbers representing the possible values of the field
   */
  static #parseField(
    field: string,
    value: string,
    constraints: CronExpressionConstraint,
    now: DateTime
  ): Set<number> {
    const ret = new Set<number>()
    const aliases = this.#aliases[field] as { [key: string]: number } | undefined
    switch (field) {
      case 'month':
      case 'dayOfWeek':
        value = value.replace(/[a-z]{3}/gi, (match) => {
          match = match.toUpperCase()
          if (!aliases) {
            return 'X'
          } else if (typeof aliases[match] !== 'undefined') {
            return aliases[match].toString()
          } else {
            return 'X'
          }
        })
        break
    }
    if (value === 'X' || !constraints.validChars.test(value)) {
      return ret
    }
    if (value.includes('*')) {
      value = value.replace(/\*/g, constraints.min + '-' + constraints.max)
    } else if (value.includes('?')) {
      value = value.replace(/\?/g, constraints.min + '-' + constraints.max)
    }
    const atoms = value.split(',')
    atoms.forEach((atom) => {
      if (atom.includes('-')) {
        if (atom.includes('/')) {
          if (atom.split('/').length !== 2) {
            return
          }
          const [range, step] = atom.split('/')
          const [start, end] = range.split('-')
          const startNum = parseInt(start)
          const endNum = parseInt(end)
          const stepNum = parseInt(step)
          if (stepNum <= 0) {
            return
          }
          if (startNum > endNum) {
            return
          }
          for (let i = startNum; i <= endNum; i += stepNum) {
            ret.add(i)
          }
        } else {
          const [start, end] = atom.split('-')
          const startNum = parseInt(start)
          const endNum = parseInt(end)
          if (startNum > endNum) {
            return
          }
          for (let i = startNum; i <= endNum; i++) {
            ret.add(i)
          }
        }
      } else if (atom.includes('/')) {
        if (atom.split('/').length !== 2) {
          return
        }
        const [start, step] = atom.split('/')
        const startNum = parseInt(start)
        const stepNum = parseInt(step)
        if (stepNum <= 0) {
          return
        }
        if (startNum > constraints.max) {
          return
        }
        for (let i = startNum; i <= constraints.max; i += stepNum) {
          ret.add(i)
        }
      } else if (atom.includes('#')) {
        const [dayOfWeek, weekOfMonth] = atom.split('#')
        const dayOfWeekNum = parseInt(dayOfWeek)
        const weekOfMonthNum = parseInt(weekOfMonth)
        if (dayOfWeekNum > constraints.max) {
          return
        }
        const firstDayOfMonth = DateTime.fromObject({
          year: now.year,
          month: now.month,
          day: 1,
        })
        const firstDayOfMonthDayOfWeek = firstDayOfMonth.weekday
        const firstDayOfWeek = DateTime.fromObject({
          year: now.year,
          month: now.month,
          day: 1 + (dayOfWeekNum - firstDayOfMonthDayOfWeek),
        })
        const nthDayOfWeek = firstDayOfWeek.plus({
          weeks: weekOfMonthNum - 1,
        })
        if (nthDayOfWeek.month !== now.month) {
          return
        }
        ret.add(nthDayOfWeek.day)
      } else if (atom.includes('L')) {
        if (atom.split('/').length !== 2) {
          return
        }
        const [start, step] = atom.split('/')
        const startNum = parseInt(start)
        const stepNum = parseInt(step)
        if (stepNum <= 0) {
          return
        }
        if (startNum > constraints.max) {
          return
        }
        for (let i = startNum; i <= constraints.max; i += stepNum) {
          ret.add(i)
        }
      } else {
        const num = parseInt(atom)
        if (num >= constraints.min && num <= constraints.max) {
          ret.add(num)
        }
      }
    })
    if (field === 'millisecond') {
      const current = [...ret]
      current.forEach((num) => {
        const toAddMin = num - 9 < constraints.min ? constraints.min : num - 9
        const toAddMax = num + 9 > constraints.max ? constraints.max : num + 9
        for (let i = toAddMin; i <= toAddMax; i++) {
          ret.add(i)
        }
      })
    }
    if (field === 'dayOfWeek') {
      if (ret.has(7)) {
        ret.add(0)
      }
      if (ret.has(0)) {
        ret.add(7)
      }
    }
    return ret
  }

  /**
   * Check if the crontab expression matches the current time
   * @param crontab A crontab expression, crontab alias or unix timestamp
   * @param now A DateTime object representing the current time
   * @returns If the crontab expression matches the current time
   */
  public static crontabMatchesDateTime(crontab: string, now: DateTime): boolean {
    if (!now.isValid) {
      return false
    }
    try {
      const cronTabObject = this.getParsedCronExpression(crontab, now)
      if (cronTabObject instanceof DateTime) {
        return (
          cronTabObject >= now.minus({ milliseconds: 9 }) &&
          cronTabObject <= now.plus({ milliseconds: 9 })
        )
      }
      return [
        cronTabObject.millisecondly.has(now.millisecond),
        cronTabObject.secondly.has(now.second),
        cronTabObject.minutely.has(now.minute),
        cronTabObject.hourly.has(now.hour),
        cronTabObject.dayOfMonthly.has(now.day),
        cronTabObject.monthly.has(now.month),
        cronTabObject.dayOfWeekly.has(now.weekday),
      ].every((value) => value === true)
    } catch {
      return false
    }
  }

  /**
   * Parses the given cron expression and returns either a `DateTime` object representing the next time the cron expression will match, or a `CronTabObject` containing the parsed cron expression.
   * @param {string} cronExpression - The cron expression to parse.
   * @param {DateTime} [now] - The current date and time to use as a reference when calculating the next match time. If not provided, the current date and time will be used.
   * @throws {Error} - Throws an error if the cron expression is so invalid that it cannot be recognized, or if the `now` parameter is not a valid `DateTime` object.
   * @returns {DateTime | CronTabObject} - A `DateTime` object representing the next time the cron expression will match, or a `CronTabObject` containing the parsed cron expression.
   */
  public static getParsedCronExpression(
    cronExpression: string,
    now?: DateTime
  ): DateTime | CronTabObject {
    if (!now) {
      now = DateTime.now().toUTC()
    } else if (!now.isValid) {
      throw new Error('Invalid DateTime object')
    }
    // check if we're dealing with an aliased expression
    if (cronExpression.startsWith('@')) {
      const expression = this.#aliases.expressions[cronExpression]
      if (expression) {
        return this.getParsedCronExpression(expression)
      }
    }
    const crontabParts = cronExpression
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((part) => part.trim())
    // if we're only dealing with 1 part, then we're dealing with a unix timestamp
    if (crontabParts.length === 1) {
      return DateTime.fromSeconds(parseInt(crontabParts[0]))
    }
    if (crontabParts.length > 7) {
      throw new Error('Invalid crontab expression')
    }
    while (crontabParts.length < 7) {
      crontabParts.unshift('0')
    }
    const [cronMil, cronSec, cronMin, cronHour, cronDayOfMonth, cronMonth, cronDayOfWeek] =
      crontabParts
    const cronTabObject = {
      millisecondly: this.#parseField(
        'millisecond',
        cronMil,
        this.#crontabContraints.millisecondly,
        now
      ),
      secondly: this.#parseField('second', cronSec, this.#crontabContraints.secondly, now),
      minutely: this.#parseField('minute', cronMin, this.#crontabContraints.minutely, now),
      hourly: this.#parseField('hour', cronHour, this.#crontabContraints.hourly, now),
      dayOfMonthly: this.#parseField(
        'dayOfMonth',
        cronDayOfMonth,
        this.#crontabContraints.dayOfMonthly,
        now
      ),
      monthly: this.#parseField('month', cronMonth, this.#crontabContraints.monthly, now),
      dayOfWeekly: this.#parseField(
        'dayOfWeek',
        cronDayOfWeek,
        this.#crontabContraints.dayOfWeekly,
        now
      ),
    }
    return cronTabObject
  }
}

/** {@inheritDoc MiliCron} */
export default MiliCron
