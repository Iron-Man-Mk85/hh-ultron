import type { HHModule } from './HHModule';

declare global {
    interface Window {
        $?: JQueryStatic;
        hhPlusPlusConfig?: {
            registerGroup(group: { key: string; name: string }): void;
            registerModule(module: HHModule): void;
            loadConfig(): void;
            runModules(): void;
        };
        HHPlusPlus: {
            Helpers: {
                doWhenSelectorAvailable(selector: string, callback: () => void): void;
            };
        };
    }
}
