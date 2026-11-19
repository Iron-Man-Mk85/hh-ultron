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
            label: `Use spacebar to close:`,
            subSettings: [{
                key: 'daddyrinthRelic',
                label: `Daddyrinth flow confirmations`,
                default: false
            }, {
                key: 'daddyrinthBattle',
                label: `Daddyrinth MM-perform_and_skip, rewards (only if won)`,
                default: false
            }, {
                key: 'leagueBattle',
                label: `League battle confirmation`,
                default: false
            }, {
                key: 'activitiesReward',
                label: `Rewards in Activities page`,
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
