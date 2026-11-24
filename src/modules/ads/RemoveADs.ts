import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { removeClassWhenSelectorAvailable } from '../../dom';
import { closeHomeAds, getAdPlacement, hideAdPlacement } from './adPlacements';

export class RemoveADs extends HHModule {
    private adGuardStarted = false;

    constructor() {
        const baseKey = 'removeADs'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Hide ads", "Hide ad placements and stop their embedded players on supported game pages."),
            subSettings: [{
                key: 'close_home',
                label: settingHelp("Include homepage ads", "Close homepage ads so the game can show its next offer. Keep ads that offer kobans."),
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return Boolean(getAdPlacement());
    }

    runFromSavedSettings() {
        if (!this.shouldRun()) return;
        let settings: Record<string, unknown> | null;
        try {
            settings = JSON.parse(localStorage.getItem('HHPlusPlusConfig') ?? 'null');
        } catch {
            // Let HH++ initialize the module normally if storage is unavailable.
            return;
        }
        if (settings?.Ultron_removeADs === true) {
            this.startAdGuard(settings.Ultron_removeADs_close_home === true);
        }
    }

    private startAdGuard(closeHome: boolean) {
        const placement = getAdPlacement();
        if (this.adGuardStarted || !placement || (placement.home && !closeHome)) return;
        if (placement.home) closeHomeAds();
        else hideAdPlacement(placement);
        this.adGuardStarted = true;
    }

    run({ close_home }: ModuleSettings) {
        if (this.hasRun) return;

        const placement = getAdPlacement();
        if (!placement) return;

        this.startAdGuard(close_home);
        if (placement.clearReservedHeight) {
            removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
        }

        this.hasRun = true
    }
}
