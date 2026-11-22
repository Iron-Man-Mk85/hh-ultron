import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { removeClassWhenSelectorAvailable } from '../../dom';
import { getAdPlacement, hideAdPlacement } from './adPlacements';

export class RemoveADs extends HHModule {
    constructor() {
        const baseKey = 'removeADs'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Hide ads", "Hide ad placements and stop their embedded players on supported game pages."),
            subSettings: [{
                key: 'close_home',
                label: settingHelp("Homepage ads", "Hide embedded homepage ads and keep the koban collection option."),
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return Boolean(getAdPlacement());
    }

    run({ close_home }: ModuleSettings) {
        if (this.hasRun) return;

        const placement = getAdPlacement();
        if (!placement) return;

        if (!placement.keepControls || close_home) hideAdPlacement(placement);
        if (placement.clearReservedHeight) {
            removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
        }

        this.hasRun = true
    }
}
