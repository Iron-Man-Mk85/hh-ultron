import { currentPage } from '../../game';
import { HHModule } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import css from './updateNotice.css';

const seenKey = `HHUltronUpdateSeen${USERSCRIPT_CHANNEL}`;

function hasNewVersion() {
    try {
        const seen = localStorage.getItem(seenKey);
        return !seen || USERSCRIPT_VERSION.localeCompare(seen, undefined, { numeric: true }) > 0;
    } catch {
        return true;
    }
}

export class UpdateNotice extends HHModule {
    private notice: HTMLButtonElement | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private waitingForAnchor = false;
    private dismissed = false;

    constructor() {
        const baseKey = 'updateNotice';
        super({ name: baseKey, configSchema: {
            baseKey,
            label: settingHelp('Update indicator', 'Show an Ultron icon beside HH++ when the installed version changes. Click it to dismiss.'),
            default: true
        } });
    }

    shouldRun() {
        return currentPage === '/home.html';
    }

    run() {
        if (this.hasRun || !this.shouldRun()) return;
        this.hasRun = true;
        if (this.dismissed || this.waitingForAnchor || !hasNewVersion()) return;

        const selector = '.hh-plus-plus-config-button';
        this.waitingForAnchor = true;
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
            this.waitingForAnchor = false;
            const anchor = document.querySelector<HTMLElement>(selector);
            const parent = anchor?.parentElement;
            if (!anchor || !parent || !this.hasRun || this.dismissed || this.notice || !hasNewVersion()) return;

            if (!document.querySelector('style.ultron-update-style')) {
                const style = document.createElement('style');
                style.className = 'ultron-update-style';
                style.textContent = css;
                document.head.appendChild(style);
            }
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ultron-update-notice';
            button.textContent = 'U';
            button.dataset.tooltip = `Ultron was updated to v${USERSCRIPT_VERSION}`;
            button.setAttribute('aria-label', `${button.dataset.tooltip}. Dismiss update indicator.`);
            button.addEventListener('click', event => {
                event.stopPropagation();
                this.dismissed = true;
                try {
                    localStorage.setItem(seenKey, USERSCRIPT_VERSION);
                } catch {
                    // The indicator can still be dismissed for the current page.
                }
                this.removeNotice();
            });
            anchor.after(button);
            this.notice = button;

            const position = () => {
                button.style.left = `${anchor.offsetLeft}px`;
                button.style.top = `${anchor.offsetTop + anchor.offsetHeight / 2}px`;
                button.style.height = `${anchor.offsetHeight * .7}px`;
            };
            position();
            this.resizeObserver = new ResizeObserver(position);
            this.resizeObserver.observe(anchor);
            this.resizeObserver.observe(parent);
        });
    }

    tearDown() {
        this.hasRun = false;
        this.removeNotice();
    }

    private removeNotice() {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.notice?.remove();
        this.notice = null;
    }
}
