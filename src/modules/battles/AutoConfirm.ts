import { settingHelp } from '../../settingsHelp';
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
            label: settingHelp("Auto-confirm dialogs", "Close eligible battle and reward dialogs in the selected modes."),
            subSettings: [{
                key: 'daddyrinthRelic',
                label: settingHelp("Labyrinth relics", "Confirm the relic reward dialog."),
                default: false
            }, {
                key: 'leagueWin',
                label: settingHelp("League wins", "Close the league victory reward dialog."),
                default: false
            // }, {
            //     key: 'leagueLoss',
            //     label: `League loss confirmation`,
            //     default: false
            }, {
                key: 'pantheonLoss',
                label: settingHelp("Pantheon losses", "Close the Pantheon loss dialog."),
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
