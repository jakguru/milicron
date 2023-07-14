import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import MiliCron from '../index'

test.group('Matching', (group) => {
  const daemon = new MiliCron()
  const dto = { zone: 'UTC' }
  const cases = [
    /**
     * Standard Matching Cases
     */
    {
      crontab: '* * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '',
      datetime: DateTime.now(),
      expected: false,
    },
    {
      crontab: '*    *    *    *    *    *    *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '*\t*\t*\t*    *    *    *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '1200 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '-10 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '- * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '* * * * * * 8',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '* * * * * * 1,2,3,5',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '* * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '* * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 1,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '* * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '* * * * * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 1,
        },
        dto
      ),
      expected: false,
    },
    /**
     * Proving 1/100th of a second resolution
     */
    {
      crontab: '*/2 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 1,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '*/100 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '*/100 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: true,
    },
    /**
     * Some invalid character tests
     */
    {
      crontab: '! * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '0,1-A * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '*/0 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '*/-100 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '*/10/10 * * * * * *',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 1,
          minute: 1,
          second: 0,
          millisecond: 101,
        },
        dto
      ),
      expected: false,
    },
    /**
     * Some alias testing
     */
    {
      crontab: '@yearly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@yearly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '@monthly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@monthly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '@weekly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@weekly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '@daily',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@daily',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '@hourly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@hourly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 1,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: '@hourly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: '@hourly',
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 3,
          hour: 1,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
    {
      crontab: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      )
        .toSeconds()
        .toString(),
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      )
        .toSeconds()
        .toString(),
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 5,
        },
        dto
      ),
      expected: true,
    },
    {
      crontab: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        dto
      )
        .toSeconds()
        .toString(),
      datetime: DateTime.fromObject(
        {
          year: 2021,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 10,
        },
        dto
      ),
      expected: false,
    },
  ]
  group.teardown(() => {
    daemon.stop()
  })
  group.each.teardown(() => {
    daemon.stop()
    daemon.$clear()
  })

  cases.forEach(({ crontab, datetime, expected }) => {
    test(`"${crontab}" should ${expected ? '' : 'not '}match ${datetime.toISO()}`, ({ assert }) => {
      assert.equal(MiliCron.crontabMatchesDateTime(crontab, datetime), expected)
    })
  })
})
