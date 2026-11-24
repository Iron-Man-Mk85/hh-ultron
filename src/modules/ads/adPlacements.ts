import { closeTargetWhenTriggerAvailableInsideContainer } from '../../dom';

interface AdPlacement {
    page: string | RegExp;
    selector: string;
    clearReservedHeight?: boolean;
    home?: boolean;
}

const placements: AdPlacement[] = [
    { page: '/activities.html', selector: '.ad-revive-container', clearReservedHeight: true },
    { page: /\/quest\/\d+$/, selector: '#ad_quest' },
    { page: '/boss-bang-battle.html', selector: '#ad_battle' },
    { page: '/champions-map.html', selector: '#ad_champions_map' },
    { page: '/god-path.html', selector: '#ad_god-path' },
    { page: /\/characters\/\d+$/, selector: '#ad_harem' },
    { page: /^\/(?:home\.html)?$/, selector: '#ad_home', home: true },
    { page: '/labyrinth.html', selector: '#ad_labyrinth' },
    { page: '/labyrinth-battle.html', selector: '#ad_battle' },
    { page: '/labyrinth-pre-battle.html', selector: '#ad_labyrinth-pre-battle' },
    { page: '/league-battle.html', selector: '#ad_battle' },
    { page: '/love-raids.html', selector: '#ad_love_raids', clearReservedHeight: true },
    { page: '/pantheon-battle.html', selector: '#ad_battle' },
    { page: '/season.html', selector: '#ad_season' },
    { page: '/season-battle.html', selector: '#ad_battle' },
    { page: '/shop.html', selector: '#ad_shop' },
    { page: '/troll-battle.html', selector: '#ad_battle' },
    { page: '/world-boss-battle.html', selector: '#ad_battle' }
];

export function getAdPlacement() {
    const pathname = location.pathname;
    return placements.find(({ page }) => typeof page === 'string' ? pathname.includes(page) : page.test(pathname));
}

export function closeHomeAds() {
    const watch = () => {
        for (const selector of ['#ad_home', '#crosspromo_show_ad']) {
            closeTargetWhenTriggerAvailableInsideContainer(`${selector}:not(:has(.hard_currency_icn))`, {
                targetSelector: ':scope > close',
                once: false,
                timeout: null,
                // Give the game time to wire up the close button and render any reward.
                delay: 500
            });
        }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch, { once: true });
    else watch();
}

export function hideAdPlacement({ selector }: AdPlacement) {
    let stylesInstalled = false;
    const unload = (placement: HTMLElement) => {
        if (!stylesInstalled) {
            const style = document.createElement('style');
            // Places of Power calls .show() on the ad slot when opening the list.
            style.textContent = `${selector} { display: none !important; }`;
            document.head.appendChild(style);
            stylesInstalled = true;
        }
        // CSS hiding alone leaves the embedded players running.
        placement.querySelectorAll('iframe, audio, video, embed, object').forEach(media => media.remove());
    };
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>(selector).forEach(unload);
    const observer = new MutationObserver(records => {
        for (const { addedNodes } of records) {
            for (const node of addedNodes) {
                if (!(node instanceof HTMLElement) || !node.isConnected) continue;
                const placement = node.closest<HTMLElement>(selector);
                if (placement) unload(placement);
                else scan(node);
            }
        }
    });
    observer.observe(document, { subtree: true, childList: true });
    scan(document);
}
