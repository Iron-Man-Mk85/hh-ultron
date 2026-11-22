import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';
import { closeTargetWhenTriggerAvailableInsideContainer } from '../../dom';

export class ClosePopups extends HHModule {
    constructor() {
        const baseKey = 'closePopups'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Auto-close more popups", "Choose which pages get automatic dismissal. The homepage option includes shop and news, so it can be used on its own."),
            subSettings: [{
                key: 'homepage',
                label: settingHelp("Homepage shop, news and offers", "Close the shop, news, trial Monthly Card and eligible special offers when the homepage loads."),
                default: true
            }, {
                key: 'season',
                label: settingHelp("Season Pass reminder", "Close the pass reminder when the Season page loads."),
                default: true,
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/home.html') ||
        currentPage.includes('/season.html')
    }

    run({ homepage, season }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (currentPage.includes('/home.html') && homepage) {
            closeTargetWhenTriggerAvailableInsideContainer('#no_HC', { timeout: 2000, delay: [250,300] });
            closeTargetWhenTriggerAvailableInsideContainer('#news_details_popup', { targetSelector: '.back_button', timeout: 2000, delay: [250,300] });
            closeTargetWhenTriggerAvailableInsideContainer('#popup_news', { timeout: 2000, delay: [250,300] });
            closeTargetWhenTriggerAvailableInsideContainer('#trial_monthly_card_popup', { timeout: 2000, delay: [250,300] });
            closeTargetWhenTriggerAvailableInsideContainer('#unique_deal_popup', { timeout: 2000, delay: [250,300] });
        } else if (currentPage.includes('/season.html') && season) {
            closeTargetWhenTriggerAvailableInsideContainer('#pass_reminder_popup', { timeout: 2000, delay: [250,300] });
        }

        this.hasRun = true
    }
}
