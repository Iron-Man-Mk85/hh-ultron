import homeAdStyles from './homeAd.css';

interface AdPlacement {
    page: string | RegExp;
    selector: string;
    clearReservedHeight?: boolean;
    keepControls?: boolean;
}

const placements: AdPlacement[] = [
    { page: '/activities.html', selector: '.ad-revive-container', clearReservedHeight: true },
    { page: /\/quest\/\d+$/, selector: '#ad_quest' },
    { page: '/boss-bang-battle.html', selector: '#ad_battle' },
    { page: '/champions-map.html', selector: '#ad_champions_map' },
    { page: '/god-path.html', selector: '#ad_god-path' },
    { page: /\/characters\/\d+$/, selector: '#ad_harem' },
    { page: '/home.html', selector: '#ad_home', keepControls: true },
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

function isMembershipBanner(placement: HTMLElement) {
    if (!placement.querySelector('.become-member-text')) return false;
    const actions = placement.querySelectorAll('.bottom-block-container :is(button, a, [role="button"])');
    return actions.length === 1 && actions[0].matches('[onclick*="openBundles"][onclick*="monthly_card"]');
}

export function hideAdPlacement({ selector, keepControls }: AdPlacement) {
    let stylesInstalled = false;
    const unload = (placement: HTMLElement) => {
        if (keepControls && isMembershipBanner(placement)) {
            placement.remove();
            return;
        }
        if (!stylesInstalled) {
            const style = document.createElement('style');
            // Places of Power calls .show() on the ad slot when opening the list.
            style.textContent = keepControls ? homeAdStyles : `${selector} { display: none !important; }`;
            document.head.appendChild(style);
            stylesInstalled = true;
        }
        if (keepControls) placement.classList.add('ultron-ad-media-hidden');

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
