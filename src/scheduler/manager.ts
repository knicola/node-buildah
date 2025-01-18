import type { Schedule } from './schedule'

export class Manager {
    protected $tasks: Schedule[] = []

    constructor (tasks: Schedule[]) {
        this.$tasks = tasks
    } // constructor()

    public async start (): Promise<void> {
        this.$tasks.forEach(task => task.start())
    } // start()

    public stop (): void {
        this.$tasks.forEach(task => task.stop())
    } // stop()
} // class
