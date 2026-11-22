import { currentPage } from './game';
import { mountSettingsHelp } from './settingsHelp';
import css from './settings.css';

const categoryLabels = [
    { key: 'removeADs', label: 'Ads and popups' },
    { key: 'autoConfirm', label: 'Battles and rewards' },
    { key: 'updateNotice', label: 'Script updates' }
];

export function injectStyles() {
    const style = document.createElement('style');
    style.className = 'hh-ultron-style';
    const version = `v${USERSCRIPT_VERSION}${USERSCRIPT_CHANNEL === 'Dev' ? ' Dev' : ''}`;
    style.textContent = `${css}
        .hh-plus-plus-config-panel { --ultron-version: "${version}"; }
    `;
    document.head.appendChild(style);
}

export function packSettings() {
    if (currentPage !== '/home.html') return;

    const selector = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const panel = document.querySelector<HTMLElement>(selector);
        if (!panel || panel.classList.contains('ultron-settings-layout')) return;
        panel.classList.remove('hh-scroll');
        for (const { key, label } of categoryLabels) {
            const card = panel.querySelector(`.config-setting[rel="Ultron_${key}"]`);
            if (!card) continue;

            const heading = document.createElement('h5');
            heading.className = 'ultron-setting-category';
            heading.textContent = label;
            card.prepend(heading);
        }
        panel.classList.add('ultron-settings-layout');
        mountSettingsHelp(panel, 'ultron-setting-tooltip');
        window.addEventListener('wheel', event => {
            if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
            const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
            panel.scrollTop += event.deltaY * unit / scale;
        }, { capture: true, passive: false });

        const cards = panel.querySelectorAll<HTMLElement>(':scope > .config-setting');
        const pack = () => {
            if (!panel.offsetWidth) return;

            for (const card of cards) {
                card.style.setProperty('--ultron-setting-rows', String(card.offsetHeight + 10));
            }
            panel.classList.add('ultron-packed-settings');
        };
        const layoutObserver = new ResizeObserver(pack);
        layoutObserver.observe(panel);
        cards.forEach(card => layoutObserver.observe(card));
        pack();
    });
}
