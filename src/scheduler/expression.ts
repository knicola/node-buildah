export class Expression {
    public seconds: string = '*'
    public minutes: string = '*'
    public hours: string = '*'
    public days: string = '*'
    public months: string = '*'
    public weekdays: string = '*'

    constructor (expression?: string) {
        if (expression) {
            this.parse(expression)
        }
    } // constructor()

    public parse (expression: string): void {
        const parts = expression.split(' ')
        if (parts.length < 5 && parts.length > 6) {
            throw new Error('Invalid cron pattern')
        }
        if (parts.length === 5) {
            parts.unshift('*')
        }
        this.seconds = parts[0]
        this.minutes = parts[1]
        this.hours = parts[2]
        this.days = parts[3]
        this.months = parts[4]
        this.weekdays = parts[5]
    } // parse()

    public toString (): string {
        return [this.seconds, this.minutes, this.hours, this.days, this.months, this.weekdays].join(' ')
    } // toString()
} // class
