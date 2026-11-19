import { currentPage } from './game';
import { mountSettingsHelp } from './settingsHelp';
import css from './settings.css';

export function injectStyles() {
    const style = document.createElement('style');
    style.className = 'hh-ultron-style';
    style.textContent = css;
    document.head.appendChild(style);
}

export function packSettings() {
    if (currentPage !== '/home.html') return;

    const selector = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const panel = document.querySelector<HTMLElement>(selector);
        if (!panel) return;
        panel.classList.remove('hh-scroll');
        mountSettingsHelp(panel, 'ultron-setting-tooltip');
        window.addEventListener('wheel', event => {
            if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
            const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
            panel.scrollTop += event.deltaY * unit / scale;
        }, { capture: true, passive: false });

        const cards = panel.querySelectorAll<HTMLElement>('.config-setting');
        const pack = () => {
            if (!panel.offsetWidth) return;

            for (const card of cards) {
                card.style.setProperty('--ultron-setting-rows', String(card.offsetHeight + 10));
            }
            panel.classList.add('ultron-packed-settings');
        };
        const groupObserver = new MutationObserver(pack);
        if (panel.parentElement) groupObserver.observe(panel.parentElement, { attributeFilter: ['class'] });
        if (typeof ResizeObserver !== 'undefined') {
            const sizeObserver = new ResizeObserver(pack);
            cards.forEach(card => sizeObserver.observe(card));
        }
        pack();
    });
}
