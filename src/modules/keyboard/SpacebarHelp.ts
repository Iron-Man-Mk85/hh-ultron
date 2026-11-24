import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage, rewardButton } from '../../game';
import { spacebarToClick } from '../../dom';

export class SpacebarHelp extends HHModule {
    constructor() {
        const baseKey = 'spacebarHelp'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Spacebar shortcuts", "Use Space to confirm eligible rewards and dialogs in the selected modes."),
            subSettings: [{
                key: 'daddyrinthRelic',
                label: settingHelp("Labyrinth rewards and healing", "Use Space on relics, heal dialogs, and eligible rewards."),
                default: false
            }, {
                key: 'daddyrinthBattle',
                label: settingHelp("Labyrinth fight and skip", "Use Space to perform and skip, or confirm when you win."),
                default: false
            }, {
                key: 'leagueBattle',
                label: settingHelp("League rewards", "Use Space on the league reward confirmation."),
                default: false
            }, {
                key: 'activitiesReward',
                label: settingHelp("Activities rewards", "Use Space on the Activities reward dialog."),
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/labyrinth.html') ||
        currentPage.includes('/labyrinth-pre-battle.html') ||
        currentPage.includes('/labyrinth-battle.html') ||
        currentPage.includes('/leagues.html') ||
        currentPage.includes('/league-battle.html') ||
        currentPage.includes('/activities.html')
    }

    run({ daddyrinthRelic, daddyrinthBattle, leagueBattle, activitiesReward }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (currentPage.includes('/labyrinth.html') && daddyrinthRelic) {
            spacebarToClick([
                { selector: '#labyrinth_reward_popup #close-relic-popup' },
                { selector: `#rewards_popup ${rewardButton}` },
                { selector: '#heal_girl_labyrinth_popup button.blue_button_L' }
            ]);
        } else if ((currentPage.includes('/labyrinth-pre-battle.html') || currentPage.includes('/labyrinth-battle.html')) && daddyrinthBattle) {
            spacebarToClick([
                { selector: `#rewards_popup ${rewardButton}`, triggerSelector: '#rewards_popup #reward_holder' },
                { selector: '#pre-battle .blue_button_L:nth-of-type(2)' }
            ]);
        } else if ((currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html')) && leagueBattle) {
            spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
        } else if (currentPage.includes('/activities.html') && activitiesReward) {
            spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
        }

        this.hasRun = true
    }
}
