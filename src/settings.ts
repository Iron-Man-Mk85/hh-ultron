import { currentPage } from './game';
import { mountSettingsHelp } from './settingsHelp';
import css from './settings.css';

const columns = [
    [{ id: 'ultron-ads-and-popups', label: 'Ads and popups', keys: ['removeADs', 'hidePopups', 'closePopups'] }],
    [
        { id: 'ultron-battles-and-rewards', label: 'Battles and rewards', keys: ['autoConfirm', 'spacebarHelp'] },
        { id: 'ultron-script-updates', label: 'Script updates', keys: ['updateNotice'] }
    ]
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
        for (const sections of columns) {
            const column = document.createElement('div');
            column.className = 'ultron-settings-column';
            for (const { id, label, keys } of sections) {
                const cards = keys.flatMap(key => {
                    const card = panel.querySelector(`.config-setting[rel="Ultron_${key}"]`);
                    return card ? [card] : [];
                });
                if (!cards.length) continue;

                const section = document.createElement('section');
                section.className = 'ultron-settings-section';
                section.setAttribute('aria-labelledby', id);
                const heading = document.createElement('h5');
                heading.id = id;
                heading.textContent = label;
                section.append(heading, ...cards);
                column.appendChild(section);
            }
            if (column.childElementCount) panel.appendChild(column);
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
    });
}
