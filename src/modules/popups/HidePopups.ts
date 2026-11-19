import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import { currentPage } from '../../game';
import { closeTargetWhenTriggerAvailableInsideContainer } from '../../dom';

export class HidePopups extends HHModule {
    constructor() {
        const baseKey = 'hidePopups'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Shop and news popups", "Dismiss shop and news popups that open within the first two seconds."),
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/home.html')
    }

    run() {
        if (this.hasRun || !this.shouldRun()) {return}

        closeTargetWhenTriggerAvailableInsideContainer('#no_HC', { timeout: 2000 });
        closeTargetWhenTriggerAvailableInsideContainer('#news_details_popup', { targetSelector: '.back_button', timeout: 2000 });
        closeTargetWhenTriggerAvailableInsideContainer('#popup_news', { timeout: 2000 });

        this.hasRun = true
    }
}
