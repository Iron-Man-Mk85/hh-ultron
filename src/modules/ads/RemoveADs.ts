import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';
import { hideWhenSelectorAvailable, removeClassWhenSelectorAvailable, clickWhenSelectorAvailable } from '../../dom';

export class RemoveADs extends HHModule {
    constructor() {
        const baseKey = 'removeADs'
        const configSchema = {
            baseKey,
            default: false,
            label: `Remove ADs from the game`,
            subSettings: [{
                key: 'close_home',
                label: `Close ADs in homepage. Keep kobans collecting`,
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/activities.html') ||
        (/\/quest\/\d+$/.test(currentPage)) ||
        currentPage.includes('/boss-bang-battle.html') ||
        currentPage.includes('/champions-map.html') ||
        currentPage.includes('/god-path.html') ||
        (/\/characters\/\d+$/.test(currentPage)) ||
        currentPage.includes('/home.html') ||
        currentPage.includes('/labyrinth.html') ||
        currentPage.includes('/labyrinth-battle.html') ||
        currentPage.includes('/labyrinth-pre-battle.html') ||
        currentPage.includes('/league-battle.html') ||
        currentPage.includes('/love-raids.html') ||
        currentPage.includes('/pantheon-battle.html') ||
        currentPage.includes('/season.html') ||
        currentPage.includes('/season-battle.html') ||
        currentPage.includes('/shop.html') ||
        currentPage.includes('/troll-battle.html') ||
        currentPage.includes('/world-boss-battle.html')
    }

    run({ close_home }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (currentPage.includes('/activities.html')) {
            hideWhenSelectorAvailable('.ad-revive-container', { once: false });
            removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
        } else if (/\/quest\/\d+$/.test(currentPage)) {
            hideWhenSelectorAvailable('#ad_quest');
        } else if (currentPage.includes('/boss-bang-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/champions-map.html')) {
            hideWhenSelectorAvailable('#ad_champions_map');
        } else if (currentPage.includes('/god-path.html')) {
            hideWhenSelectorAvailable('#ad_god-path');
        } else if (/\/characters\/\d+$/.test(currentPage)) {
            hideWhenSelectorAvailable('#ad_harem');
        } else if (currentPage.includes('/home.html')) {
            if (close_home) clickWhenSelectorAvailable('.become-member-text', 'close', { delay: [500, 1500], once: false });
        } else if (currentPage.includes('/labyrinth.html')) {
            hideWhenSelectorAvailable('#ad_labyrinth', { once: false, timeout: null });
        } else if (currentPage.includes('/labyrinth-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/labyrinth-pre-battle.html')) {
            hideWhenSelectorAvailable('#ad_labyrinth-pre-battle', { once: false });
        } else if (currentPage.includes('/league-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/love-raids.html')) {
            hideWhenSelectorAvailable('#ad_love_raids');
            removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
        } else if (currentPage.includes('/pantheon-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/season.html')) {
            hideWhenSelectorAvailable('#ad_season');
        } else if (currentPage.includes('/season-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/shop.html')) {
            hideWhenSelectorAvailable('#ad_shop');
        } else if (currentPage.includes('/troll-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        } else if (currentPage.includes('/world-boss-battle.html')) {
            hideWhenSelectorAvailable('#ad_battle');
        }

        this.hasRun = true
    }
}
