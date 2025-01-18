import { Expression } from './expression'
import { DAYS } from './constants'
import { array } from './helpers'

export class Frequency {
    protected $expression: Expression = new Expression('0 * * * * *')
    protected $timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone

    /**
     * Run the task on a custom cron schedule
     * @example cron('* * * * *')
     * @param schedule
     */
    public cron (schedule: string): this {
        this.$expression.parse(schedule)
        return this
    } // cron()

    /**
     * Set the timezone the date should be evaluated on.
     * @param timezone The timezone to use
     * @example timezone('Europe/Berlin')
     */
    public timezone (timezone: string): this {
        this.$timezone = timezone
        return this
    } // timezone()

    /**
     * Run the task every second
     */
    public everySecond (): this {
        this.$expression.seconds = '*'
        return this
    } // everySecond()

    /**
     * Run the task every two seconds
     */
    public everyTwoSeconds (): this {
        this.$expression.seconds = '*/2'
        return this
    } // everyTwoSeconds()

    /**
     * Run the task every three seconds
     */
    public everyThreeSeconds (): this {
        this.$expression.seconds = '*/3'
        return this
    } // everyTwoSeconds()

    /**
     * Run the task every four seconds
     */
    public everyFourSeconds (): this {
        this.$expression.seconds = '*/4'
        return this
    } // everyFourSeconds()

    /**
     * Run the task every five seconds
     */
    public everyFiveSeconds (): this {
        this.$expression.seconds = '*/5'
        return this
    } // everyFiveSeconds()

    /**
     * Run the task every ten seconds
     */
    public everyTenSeconds (): this {
        this.$expression.seconds = '*/10'
        return this
    } // everyTenSeconds()

    /**
     * Run the task every fifteen seconds
     */
    public everyFifteenSeconds (): this {
        this.$expression.seconds = '*/15'
        return this
    } // everyFifteenSeconds()

    /**
     * Run the task every thirty seconds
     */
    public everyThirtySeconds (): this {
        this.$expression.seconds = '*/0,30'
        return this
    } // everyThirtySeconds()

    /**
     * Run the task every minute
     */
    public everyMinute (): this {
        this.$expression.minutes = '*'
        return this
    } // everyMinute()

    /**
     * Run the task every two minutes
     */
    public everyTwoMinutes (): this {
        this.$expression.minutes = '*/2'
        return this
    } // everyTwoMinutes()

    /**
     * Run the task every three minutes
     */
    public everyThreeMinutes (): this {
        this.$expression.minutes = '*/3'
        return this
    } // everyTwoMinutes()

    /**
     * Run the task every four minutes
     */
    public everyFourMinutes (): this {
        this.$expression.minutes = '*/4'
        return this
    } // everyFourMinutes()

    /**
     * Run the task every five minutes
     */
    public everyFiveMinutes (): this {
        this.$expression.minutes = '*/5'
        return this
    } // everyFiveMinutes()

    /**
     * Run the task every ten minutes
     */
    public everyTenMinutes (): this {
        this.$expression.minutes = '*/10'
        return this
    } // everyTenMinutes()

    /**
     * Run the task every fifteen minutes
     */
    public everyFifteenMinutes (): this {
        this.$expression.minutes = '*/15'
        return this
    } // everyFifteenMinutes()

    /**
     * Run the task every thirty minutes
     */
    public everyThirtyMinutes (): this {
        this.$expression.minutes = '*/0,30'
        return this
    } // everyThirtyMinutes()

    /**
     * Run the task every hour
     */
    public hourly (): this {
        this.$expression.minutes = '0'
        return this
    } // hourly()

    /**
     * Run the task every hour at 17 minutes past the hour
     * @example hourlyAt(17)
     */
    public hourlyAt (minutes: number): this {
        this.$expression.minutes = array(minutes).join(',')
        return this
    } // hourlyAt()

    /**
     * Run the task every odd hour
     */
    public everyOddHour (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '1-23/2'
        return this
    } // everyOddHour()

    /**
     * Run the task every two hours
     */
    public everyTwoHours (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '*/2'
        return this
    } // everyTwoHours()

    /**
     * Run the task every three hours
     */
    public everyThreeHours (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '*/3'
        return this
    } // everyThreeHours()

    /**
     * Run the task every four hours
     */
    public everyFourHours (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '*/4'
        return this
    } // everyFourHours()

    /**
     * Run the task every six hours
     */
    public everySixHours (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '*/6'
        return this
    } // everySixHours()

    /**
     * Run the task every day at midnight
     */
    public daily (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '0'
        return this
    } // daily()

    /**
     * Schedule the command at a given time.
     * @param time 24-hour time string
     * @example at('13:00')
     */
    public at (time: string): this {
        return this.dailyAt(time)
    } // at()

    /**
     * Run the task every day at 13:00
     * @param time 24-hour time string
     * @example dailyAt('13:00')
     */
    public dailyAt (time: string): this {
        const parts = time.split(':')

        this.$expression.minutes = parts[1] || '0'
        this.$expression.hours = parts[0] || '0'

        return this
    } // dailyAt()

    /**
     * Run the task daily at 1:00 & 13:00
     * @param hour1 First hour
     * @param hour2 Second hour
     * @example twiceDaily(1, 13)
     */
    public twiceDaily (hour1: number, hour2: number): this {
        return this.twiceDailyAt(hour1, hour2, 0)
    } // twiceDaily()

    /**
     * Run the task daily at 1:15 & 13:15
     * @param hour1 First hour
     * @param hour2 Second hour
     * @param offset Minutes offset
     * @example twiceDailyAt(1, 13, 15)
     */
    public twiceDailyAt (hour1: number = 1, hour2: number = 13, offset: number | number[] = 0): this {
        this.$expression.minutes = array(offset).join(',')
        this.$expression.hours = [hour1, hour2].join(',')
        return this
    } // twiceDailyAt()

    /**
     * Set the days of the week the command should run on.
     * @param days An array of days of the week (0-6)
     * @example days([1, 2, 3, 4, 5])
     */
    public days (days: number | number[]): this {
        this.$expression.days = array(days).join(',')
        return this
    } // days()

    /**
     * Schedule the event to run only on weekdays.
     */
    public weekdays (): this {
        return this.days([DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY, DAYS.THURSDAY, DAYS.FRIDAY])
    } // weekdays()

    /**
     * Schedule the event to run only on weekends.
     */
    public weekends (): this {
        return this.days([DAYS.SATURDAY, DAYS.SUNDAY])
    } // weekends()

    /**
     * Schedule the event to run only on Mondays.
     */
    public mondays (): this {
        return this.days(DAYS.MONDAY)
    } // mondays()

    /**
     * Schedule the event to run only on Tuesdays.
     */
    public tuesdays (): this {
        return this.days(DAYS.TUESDAY)
    } // tuesdays()

    /**
     * Schedule the event to run only on Wednesdays.
     */
    public wednesdays (): this {
        return this.days(DAYS.WEDNESDAY)
    } // wednesdays()

    /**
     * Schedule the event to run only on Thursdays.
     */
    public thursdays (): this {
        return this.days(DAYS.THURSDAY)
    } // thursdays()

    /**
     * Schedule the event to run only on Fridays.
     */
    public fridays (): this {
        return this.days(DAYS.FRIDAY)
    } // fridays()

    /**
     * Schedule the event to run only on Saturdays.
     */
    public saturdays (): this {
        return this.days(DAYS.SATURDAY)
    } // saturdays()

    /**
     * Schedule the event to run only on Sundays.
     */
    public sundays (): this {
        return this.days(DAYS.SUNDAY)
    } // sundays()

    /**
     * Run the task every Sunday at 00:00
     */
    public weekly (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '0'
        this.$expression.days = '0'
        return this
    } // weekly()

    /**
     * Run the task every week on Monday at 8:00
     * @param day Day of the week (0-6)
     * @param time 24-hour time string
     * @example weeklyOn(1, '8:00')
     */
    public weeklyOn (day: number | number[], time: string = '00:00'): this {
        this.dailyAt(time)
        return this.days(day)
    } // weeklyOn()

    /**
     * Run the task on the first day of every month at 00:00
     */
    public monthly (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '0'
        this.$expression.days = '1'
        return this
    } // monthly()

    /**
     * Run the task every month on the 4th at 15:00
     * @param day Day of the month
     * @param time 24-hour time string
     * @example monthlyOn(4, '15:00')
     */
    public monthlyOn (day: number = 1, time: string = '00:00'): this {
        this.dailyAt(time)
        this.$expression.days = day.toString()
        return this
    } // monthlyOn()

    /**
     * Run the task monthly on the 1st and 16th at 13:00
     * @param day1 First day of the month
     * @param day2 Second day of the month
     * @example twiceMonthly(1, 16, '13:00')
     */
    public twiceMonthly (day1: number = 1, day2: number = 16, time: string = '00:00'): this {
        this.dailyAt(time)
        this.$expression.days = [day1, day2].join(',')
        return this
    } // twiceMonthly()

    /**
     * Run the task on the last day of the month at 15:00
     * @param time 24-hour time string
     * @example lastDayOfMonth('15:00')
     */
    public lastDayOfMonth (time: string = '00:00'): this {
        this.dailyAt(time)
        this.$expression.days = 'L'
        return this
    } // lastDayOfMonth()

    /**
     * Run the task on the first day of every quarter at 00:00
     */
    public quarterly (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '0'
        this.$expression.days = '1'
        this.$expression.months = '1-12/3'
        return this
    } // quarterly()

    /**
     * Run the task every quarter on the 4th at 14:00
     * @param day Day of the month
     * @param time 24-hour time string
     * @example quarterlyOn(4, '14:00')
     */
    public quarterlyOn (day: number = 1, time: string): this {
        this.dailyAt(time)
        this.$expression.days = day.toString()
        this.$expression.months = '1-12/3'
        return this
    } // quarterlyOn()

    /**
     * Run the task on the first day of every year at 00:00
     */
    public yearly (): this {
        this.$expression.minutes = '0'
        this.$expression.hours = '0'
        this.$expression.days = '1'
        this.$expression.months = '1'
        return this
    } // yearly()

    /**
     * Run the task every year on June 1st at 17:00
     * @param month Month of the year (1-12)
     * @param day Day of the month
     * @param time 24-hour time string
     * @example yearlyOn(6, 1, '17:00')
     */
    public yearlyOn (month: number = 1, day: number = 1, time: string = '00:00'): this {
        this.dailyAt(time)
        this.$expression.days = day.toString()
        this.$expression.months = month.toString()
        return this
    } // yearlyOn()
} // class
