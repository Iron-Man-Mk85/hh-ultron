import { HHModule } from '../../HHModule';
import { currentPage } from '../../game';
import { closeTargetWhenTriggerAvailableInsideContainer } from '../../dom';

export class HidePopups extends HHModule {
    constructor() {
        const baseKey = 'hidePopups'
        const configSchema = {
            baseKey,
            default: false,
            label: `<span tooltip="Dismisses these popups if they open during the first 2 seconds. Use either this or 'Close popups from'.">Hide shop and news popups from the homepage</span>`,
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
