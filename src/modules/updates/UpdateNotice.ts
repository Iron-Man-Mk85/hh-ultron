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
            label: settingHelp('Update indicator', 'Show an Ultron faceplate beside HH++ when the script updates. Hover to see the version or click to dismiss.'),
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
            button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" stroke-linejoin="round">
                <path fill="#222229" stroke="currentColor" stroke-width="1.35"
                    d="M5 4.5 8.5 2h7L19 4.5l2 6-2.5 6L15 22H9l-3.5-5.5L3 10.5Z"/>
                <path fill="none" stroke="currentColor" stroke-width="1.15"
                    d="m5 4.5 2 3 5-1.2 5 1.2 2-3M3 10.5l3.7 2.4 2 2.4-1.3 3.4m13.6-8.2-3.7 2.4-2 2.4 1.3 3.4"/>
                <path fill="#ff5a65" d="m5.9 8.7 5.1 1.7-1.6 1.2-2.8-.8Zm12.2 0-5.1 1.7 1.6 1.2 2.8-.8Z"/>
                <path fill="none" stroke="#ff5a65" stroke-width="1.35" stroke-linecap="round" d="m9 16.8 3-1 3 1"/>
            </svg>`;
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
