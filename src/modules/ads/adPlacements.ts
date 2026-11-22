import { observeUntil, type ObserverOptions } from '../../dom';
import { currentPage } from '../../game';
import homeAdStyles from './homeAd.css';

interface AdPlacement {
    page: string | RegExp;
    selector: string;
    observer?: ObserverOptions;
    clearReservedHeight?: boolean;
    keepControls?: boolean;
}

const placements: AdPlacement[] = [
    { page: '/activities.html', selector: '.ad-revive-container', observer: { once: false }, clearReservedHeight: true },
    { page: /\/quest\/\d+$/, selector: '#ad_quest' },
    { page: '/boss-bang-battle.html', selector: '#ad_battle' },
    { page: '/champions-map.html', selector: '#ad_champions_map' },
    { page: '/god-path.html', selector: '#ad_god-path' },
    { page: /\/characters\/\d+$/, selector: '#ad_harem' },
    { page: '/home.html', selector: '#ad_home', keepControls: true },
    { page: '/labyrinth.html', selector: '#ad_labyrinth', observer: { once: false, timeout: null } },
    { page: '/labyrinth-battle.html', selector: '#ad_battle' },
    { page: '/labyrinth-pre-battle.html', selector: '#ad_labyrinth-pre-battle', observer: { once: false } },
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
    return placements.find(({ page }) => typeof page === 'string' ? currentPage.includes(page) : page.test(currentPage));
}

export function hideAdPlacement({ selector, observer, keepControls }: AdPlacement) {
    if (keepControls) {
        const style = document.createElement('style');
        style.textContent = homeAdStyles;
        document.head.appendChild(style);
    }
    const watched = new WeakSet<HTMLElement>();
    observeUntil(selector, (elements) => {
        elements.forEach(el => {
            if (keepControls) el.classList.add('ultron-ad-media-hidden');
            else el.style.display = 'none';
            if (watched.has(el)) return;
            watched.add(el);

            // Hiding an iframe leaves its media playing and lets the game refresh it.
            const unloadFrames = () => el.querySelectorAll('iframe').forEach(frame => frame.remove());
            unloadFrames();
            new MutationObserver(unloadFrames).observe(el, { childList: true, subtree: true });
        });
    }, observer);
}
