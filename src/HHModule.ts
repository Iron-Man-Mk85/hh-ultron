export type ModuleSettings = Record<string, boolean>;

interface ConfigSchema {
    baseKey: string;
    label: string;
    default: boolean;
    subSettings?: { key: string; label: string; default: boolean }[];
}

export abstract class HHModule {
    readonly group = 'Ultron';
    readonly configSchema: ConfigSchema;
    hasRun = false;

    constructor({ configSchema }: { name: string; configSchema: ConfigSchema }) {
        this.configSchema = configSchema;
    }

    abstract shouldRun(): boolean;
    abstract run(settings: ModuleSettings): void | Promise<void>;
}
