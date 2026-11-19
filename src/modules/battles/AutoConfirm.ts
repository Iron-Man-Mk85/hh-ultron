import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage, rewardButton } from '../../game';
import { closeTargetWhenTriggerAvailableInsideContainer } from '../../dom';

export class AutoConfirm extends HHModule {
    constructor() {
        const baseKey = 'autoConfirm'
        const configSchema = {
            baseKey,
            default: false,
            label: `Close specific on screen windows:`,
            subSettings: [{
                key: 'daddyrinthRelic',
                label: `Daddyrinth relic confirmation`,
                default: false
            }, {
                key: 'leagueWin',
                label: `League win confirmation`,
                default: false
            // }, {
            //     key: 'leagueLoss',
            //     label: `League loss confirmation`,
            //     default: false
            }, {
                key: 'pantheonLoss',
                label: `Pantheon loss confirmation`,
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/labyrinth.html') ||
        currentPage.includes('/leagues.html') ||
        currentPage.includes('/league-battle.html') ||
        currentPage.includes('/pantheon-battle.html')
    }

    run({ daddyrinthRelic, leagueWin, pantheonLoss }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (currentPage.includes('/labyrinth.html') && daddyrinthRelic) {
            closeTargetWhenTriggerAvailableInsideContainer('#labyrinth_reward_popup', { targetSelector: '#close-relic-popup', timeout: null, delay: [50,150] });
        } else if ((currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html')) && leagueWin) {
            closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '#reward_holder', targetSelector: rewardButton, once: false, timeout: null, delay: [50,150] });
        // } else if (currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html') && leagueLoss) {
        //     closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '#upgrade_characters', targetSelector: rewardButton, once: false, timeout: null, delay: [50,150] });
        } else if (currentPage.includes('/pantheon-battle.html') && pantheonLoss) {
            closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '.lost-first-row', targetSelector: rewardButton, timeout: null, delay: [50,150] });
        }

        this.hasRun = true
    }
}
