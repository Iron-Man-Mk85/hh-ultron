import { currentPage } from './game';
import { mountSettingsHelp } from './settingsHelp';
import css from './settings.css';

const categories = [
    { id: 'ads', label: 'Ads and popups', keys: ['removeADs', 'hidePopups', 'closePopups'] },
    { id: 'battles', label: 'Battles and rewards', keys: ['autoConfirm', 'spacebarHelp'] },
    { id: 'updates', label: 'Updates', keys: ['updateNotice'] }
];

function mountCategories(panel: HTMLElement) {
    const tabList = document.createElement('div');
    tabList.className = 'ultron-settings-categories';
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Ultron settings categories');

    const tabs = categories.flatMap(({ id, label, keys }) => {
        const cards = keys.flatMap(key => {
            const card = panel.querySelector(`:scope > .config-setting[rel="Ultron_${key}"]`);
            return card ? [card] : [];
        });
        if (!cards.length) return [];

        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `ultron-settings-tab-${id}`;
        tab.textContent = label;
        tab.setAttribute('role', 'tab');

        const page = document.createElement('div');
        page.id = `ultron-settings-page-${id}`;
        page.className = 'ultron-settings-page';
        page.setAttribute('role', 'tabpanel');
        page.setAttribute('aria-labelledby', tab.id);
        tab.setAttribute('aria-controls', page.id);
        page.append(...cards);
        tabList.append(tab);
        return [{ tab, page }];
    });
    if (!tabs.length) return;

    tabs[0].page.append(...panel.querySelectorAll(':scope > .config-setting'));
    const select = (index: number) => {
        tabs.forEach(({ tab, page }, i) => {
            const selected = i === index;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            page.hidden = !selected;
        });
    };

    tabs.forEach(({ tab }, index) => {
        tab.addEventListener('click', () => select(index));
        tab.addEventListener('keydown', event => {
            let next: number;
            switch (event.key) {
                case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break;
                case 'ArrowRight': next = (index + 1) % tabs.length; break;
                case 'Home': next = 0; break;
                case 'End': next = tabs.length - 1; break;
                default: return;
            }
            event.preventDefault();
            event.stopPropagation();
            select(next);
            tabs[next].tab.focus();
        });
    });
    select(0);
    panel.append(tabList, ...tabs.map(({ page }) => page));
}

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
        mountCategories(panel);
        panel.classList.add('ultron-settings-layout');
        mountSettingsHelp(panel, 'ultron-setting-tooltip');
        window.addEventListener('wheel', event => {
            if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const page = panel.querySelector<HTMLElement>('.ultron-settings-page:not([hidden])');
            if (!page) return;
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientHeight : 1;
            const scale = page.getBoundingClientRect().height / page.offsetHeight || 1;
            page.scrollTop += event.deltaY * unit / scale;
        }, { capture: true, passive: false });
    });
}
